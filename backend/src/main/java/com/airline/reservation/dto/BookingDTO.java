package com.airline.reservation.dto;

import com.airline.reservation.entity.Booking;
import com.airline.reservation.entity.Passenger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private String bookingReference;
    private Booking.BookingStatus status;
    private Booking.TripType tripType;
    private BigDecimal totalPrice;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private LocalDateTime createdAt;
    private FlightDTO flight;
    private List<String> seats;
    private List<PassengerDTO> passengers;
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDTO {
        private Long id;
        private String name;
        private String email;
        private String passport;
        private LocalDate dob;
        private String seatNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
    }

    public static PassengerDTO fromPassenger(Passenger p) {
        return PassengerDTO.builder()
            .id(p.getId())
            .name(p.getName())
            .email(p.getEmail())
            .passport(p.getPassport())
            .dob(p.getDob())
            .seatNumber(p.getSeatNumber())
            .build();
    }
}
