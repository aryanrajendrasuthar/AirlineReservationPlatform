package com.airline.reservation.service;

import com.airline.reservation.dto.BookingDTO;
import com.airline.reservation.dto.BookingRequest;
import com.airline.reservation.entity.*;
import com.airline.reservation.kafka.BookingEvent;
import com.airline.reservation.kafka.BookingEventProducer;
import com.airline.reservation.repository.BookingRepository;
import com.airline.reservation.repository.FlightRepository;
import com.airline.reservation.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;
    private final SeatService seatService;
    private final StripeService stripeService;
    private final BookingEventProducer eventProducer;
    private final FlightService flightService;

    @Transactional
    public BookingDTO initiateBooking(Long userId, BookingRequest request) {
        Flight flight = flightRepository.findById(request.getFlightId())
            .orElseThrow(() -> new IllegalArgumentException("Flight not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate and lock seats (rollback already-locked seats on failure)
        List<String> lockedSeats = new ArrayList<>();
        for (String seatNumber : request.getSelectedSeats()) {
            boolean locked = seatService.lockSeat(flight.getId(), seatNumber);
            if (!locked) {
                lockedSeats.forEach(s -> seatService.unlockSeat(flight.getId(), s));
                throw new IllegalStateException("Seat " + seatNumber + " is no longer available");
            }
            lockedSeats.add(seatNumber);
        }

        // Calculate total price
        BigDecimal totalPrice = calculateTotalPrice(flight.getId(), request.getSelectedSeats());

        // Create booking
        String bookingRef = generateBookingReference();
        Booking booking = Booking.builder()
            .user(user)
            .flight(flight)
            .seats(request.getSelectedSeats())
            .totalPrice(totalPrice)
            .bookingReference(bookingRef)
            .tripType(request.getTripType())
            .status(Booking.BookingStatus.PENDING)
            .build();

        // Add passengers
        List<Passenger> passengers = request.getPassengers().stream()
            .map(p -> Passenger.builder()
                .name(p.getName())
                .email(p.getEmail())
                .passport(p.getPassport())
                .dob(p.getDob())
                .seatNumber(p.getSeatNumber())
                .booking(booking)
                .build())
            .collect(Collectors.toList());
        booking.setPassengers(passengers);
        bookingRepository.save(booking);

        // Create Stripe PaymentIntent
        String clientSecret = null;
        try {
            PaymentIntent pi = stripeService.createPaymentIntent(totalPrice, "usd", bookingRef);
            booking.setStripePaymentIntentId(pi.getId());
            bookingRepository.save(booking);
            clientSecret = pi.getClientSecret();
        } catch (StripeException e) {
            log.error("Stripe error for booking {}: {}", bookingRef, e.getMessage());
        }

        // Publish Kafka event
        eventProducer.publishBookingRequest(buildEvent(booking, "BOOKING_INITIATED"));

        BookingDTO dto = toDTO(booking);
        dto.setStripeClientSecret(clientSecret);
        return dto;
    }

    @Transactional
    public BookingDTO confirmBooking(Long userId, String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }

        boolean paid = booking.getStripePaymentIntentId() != null
            && stripeService.isPaymentSucceeded(booking.getStripePaymentIntentId());

        if (paid) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            seatService.markSeatsBooked(booking.getFlight().getId(), booking.getSeats());
            bookingRepository.save(booking);
            eventProducer.publishBookingConfirmed(buildEvent(booking, "BOOKING_CONFIRMED"));
        } else {
            booking.setStatus(Booking.BookingStatus.PAYMENT_FAILED);
            seatService.releaseSeats(booking.getFlight().getId(), booking.getSeats());
            bookingRepository.save(booking);
            eventProducer.publishBookingFailed(buildEvent(booking, "PAYMENT_FAILED"));
        }
        return toDTO(booking);
    }

    @Transactional
    public BookingDTO cancelBooking(Long userId, String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking already cancelled");
        }

        boolean wasConfirmed = booking.getStatus() == Booking.BookingStatus.CONFIRMED;
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (wasConfirmed) {
            seatService.releaseSeats(booking.getFlight().getId(), booking.getSeats());
        }
        bookingRepository.save(booking);
        return toDTO(booking);
    }

    public List<BookingDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllOrderByCreatedAtDesc()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public BookingDTO getBookingByReference(String reference) {
        return toDTO(bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found")));
    }

    private BigDecimal calculateTotalPrice(Long flightId, List<String> seatNumbers) {
        return seatNumbers.stream()
            .map(seatNumber -> {
                var seat = seatService.getSeatsForFlight(flightId).stream()
                    .filter(s -> s.getSeatNumber().equals(seatNumber))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatNumber));
                return seat.getPrice();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String generateBookingReference() {
        return "AR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingEvent buildEvent(Booking booking, String eventType) {
        return BookingEvent.builder()
            .eventType(eventType)
            .bookingId(booking.getId())
            .bookingReference(booking.getBookingReference())
            .userId(booking.getUser().getId())
            .userEmail(booking.getUser().getEmail())
            .userName(booking.getUser().getName())
            .flightId(booking.getFlight().getId())
            .flightNumber(booking.getFlight().getFlightNumber())
            .origin(booking.getFlight().getOriginCode())
            .destination(booking.getFlight().getDestinationCode())
            .departureTime(booking.getFlight().getDepartureTime().toString())
            .seats(booking.getSeats())
            .totalPrice(booking.getTotalPrice())
            .status(booking.getStatus().name())
            .timestamp(LocalDateTime.now().toString())
            .build();
    }

    private BookingDTO toDTO(Booking booking) {
        return BookingDTO.builder()
            .id(booking.getId())
            .bookingReference(booking.getBookingReference())
            .status(booking.getStatus())
            .tripType(booking.getTripType())
            .totalPrice(booking.getTotalPrice())
            .stripePaymentIntentId(booking.getStripePaymentIntentId())
            .createdAt(booking.getCreatedAt())
            .flight(flightService.toDTO(booking.getFlight(), null))
            .seats(booking.getSeats())
            .passengers(booking.getPassengers().stream()
                .map(BookingDTO::fromPassenger).collect(Collectors.toList()))
            .user(BookingDTO.UserInfo.builder()
                .id(booking.getUser().getId())
                .name(booking.getUser().getName())
                .email(booking.getUser().getEmail())
                .build())
            .build();
    }
}
