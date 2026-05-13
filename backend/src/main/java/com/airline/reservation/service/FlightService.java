package com.airline.reservation.service;

import com.airline.reservation.dto.AdminFlightRequest;
import com.airline.reservation.dto.FlightDTO;
import com.airline.reservation.dto.SeatDTO;
import com.airline.reservation.entity.Flight;
import com.airline.reservation.entity.Seat;
import com.airline.reservation.repository.FlightRepository;
import com.airline.reservation.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlightService {

    private static final String SEARCH_CACHE_PREFIX = "search:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public List<FlightDTO> searchFlights(String origin, String destination, String date, int passengers, Seat.SeatClass seatClass) {
        String cacheKey = SEARCH_CACHE_PREFIX + origin + ":" + destination + ":" + date;
        LocalDate searchDate = LocalDate.parse(date);
        LocalDateTime startOfDay = searchDate.atStartOfDay();
        LocalDateTime endOfDay = searchDate.atTime(23, 59, 59);

        List<Flight> flights = flightRepository.searchFlights(origin, destination, startOfDay, endOfDay);
        return flights.stream()
            .map(f -> toDTO(f, seatClass))
            .filter(dto -> {
                if (seatClass != null) {
                    FlightDTO.SeatClassInfo info = dto.getSeatClasses().get(seatClass.name());
                    return info != null && info.getAvailable() >= passengers;
                }
                return true;
            })
            .collect(Collectors.toList());
    }

    public FlightDTO getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + id));
        return toDTO(flight, null);
    }

    public List<FlightDTO> getAllFlights() {
        return flightRepository.findAllActive().stream()
            .map(f -> toDTO(f, null))
            .collect(Collectors.toList());
    }

    @Transactional
    public FlightDTO createFlight(AdminFlightRequest req) {
        Flight flight = Flight.builder()
            .flightNumber(req.getFlightNumber())
            .origin(req.getOrigin())
            .originCode(req.getOriginCode().toUpperCase())
            .destination(req.getDestination())
            .destinationCode(req.getDestinationCode().toUpperCase())
            .departureTime(req.getDepartureTime())
            .arrivalTime(req.getArrivalTime())
            .aircraft(req.getAircraft())
            .airline(req.getAirline())
            .status(req.getStatus())
            .build();
        flightRepository.save(flight);
        generateSeats(flight, req);
        return toDTO(flight, null);
    }

    @Transactional
    public FlightDTO updateFlightStatus(Long id, Flight.FlightStatus status) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + id));
        flight.setStatus(status);
        flightRepository.save(flight);
        return toDTO(flight, null);
    }

    @Transactional
    public void deleteFlight(Long id) {
        flightRepository.deleteById(id);
    }

    private void generateSeats(Flight flight, AdminFlightRequest req) {
        List<Seat> seats = new ArrayList<>();
        String[] columns = {"A", "B", "C", "D", "E", "F"};
        int firstRows = (int) Math.ceil(req.getFirstSeats() / 6.0);
        int businessRows = (int) Math.ceil(req.getBusinessSeats() / 6.0);
        int economyRows = (int) Math.ceil(req.getEconomySeats() / 6.0);
        int totalRows = firstRows + businessRows + economyRows;

        for (int row = 1; row <= totalRows; row++) {
            Seat.SeatClass cls;
            BigDecimal price;
            if (row <= firstRows) {
                cls = Seat.SeatClass.FIRST;
                price = req.getFirstPrice() != null ? req.getFirstPrice() : BigDecimal.valueOf(800);
            } else if (row <= firstRows + businessRows) {
                cls = Seat.SeatClass.BUSINESS;
                price = req.getBusinessPrice() != null ? req.getBusinessPrice() : BigDecimal.valueOf(400);
            } else {
                cls = Seat.SeatClass.ECONOMY;
                price = req.getEconomyPrice() != null ? req.getEconomyPrice() : BigDecimal.valueOf(150);
            }
            for (String col : columns) {
                seats.add(Seat.builder()
                    .flight(flight)
                    .seatNumber(row + col)
                    .seatClass(cls)
                    .price(price)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build());
            }
        }
        seatRepository.saveAll(seats);
    }

    public FlightDTO toDTO(Flight flight, Seat.SeatClass filterClass) {
        List<Seat> seats = seatRepository.findByFlightIdOrderBySeatNumber(flight.getId());
        Map<String, FlightDTO.SeatClassInfo> classInfo = new HashMap<>();

        for (Seat.SeatClass cls : Seat.SeatClass.values()) {
            long available = seats.stream()
                .filter(s -> s.getSeatClass() == cls && s.getStatus() == Seat.SeatStatus.AVAILABLE)
                .count();
            long total = seats.stream().filter(s -> s.getSeatClass() == cls).count();
            BigDecimal price = seats.stream()
                .filter(s -> s.getSeatClass() == cls)
                .map(Seat::getPrice)
                .findFirst()
                .orElse(BigDecimal.ZERO);
            classInfo.put(cls.name(), FlightDTO.SeatClassInfo.builder()
                .price(price).available((int) available).total((int) total).build());
        }

        return FlightDTO.builder()
            .id(flight.getId())
            .flightNumber(flight.getFlightNumber())
            .origin(flight.getOrigin())
            .originCode(flight.getOriginCode())
            .destination(flight.getDestination())
            .destinationCode(flight.getDestinationCode())
            .departureTime(flight.getDepartureTime())
            .arrivalTime(flight.getArrivalTime())
            .durationMinutes(flight.getDurationMinutes())
            .aircraft(flight.getAircraft())
            .airline(flight.getAirline())
            .status(flight.getStatus())
            .seatClasses(classInfo)
            .build();
    }
}
