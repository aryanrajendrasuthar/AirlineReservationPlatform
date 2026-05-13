package com.airline.reservation.config;

import com.airline.reservation.dto.AdminFlightRequest;
import com.airline.reservation.entity.User;
import com.airline.reservation.repository.FlightRepository;
import com.airline.reservation.repository.UserRepository;
import com.airline.reservation.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final FlightService flightService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedFlights();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@airline.com")) {
            userRepository.save(User.builder()
                .name("Admin")
                .email("admin@airline.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .build());
            log.info("Admin user seeded: admin@airline.com / admin123");
        }
        if (!userRepository.existsByEmail("user@airline.com")) {
            userRepository.save(User.builder()
                .name("John Doe")
                .email("user@airline.com")
                .passwordHash(passwordEncoder.encode("user123"))
                .role(User.Role.USER)
                .build());
            log.info("Demo user seeded: user@airline.com / user123");
        }
    }

    private void seedFlights() {
        if (flightRepository.count() > 0) return;
        log.info("Seeding sample flights...");

        createFlight("AA101", "New York", "JFK", "Los Angeles", "LAX",
            LocalDateTime.now().plusDays(3).withHour(8).withMinute(0),
            LocalDateTime.now().plusDays(3).withHour(11).withMinute(30),
            "Boeing 737", "American Airlines",
            150, new BigDecimal("199"), 30, new BigDecimal("499"), 10, new BigDecimal("899"));

        createFlight("UA205", "Chicago", "ORD", "Miami", "MIA",
            LocalDateTime.now().plusDays(3).withHour(10).withMinute(30),
            LocalDateTime.now().plusDays(3).withHour(14).withMinute(0),
            "Airbus A320", "United Airlines",
            120, new BigDecimal("179"), 24, new BigDecimal("449"), 8, new BigDecimal("799"));

        createFlight("DL310", "San Francisco", "SFO", "Seattle", "SEA",
            LocalDateTime.now().plusDays(3).withHour(14).withMinute(0),
            LocalDateTime.now().plusDays(3).withHour(16).withMinute(15),
            "Boeing 757", "Delta Airlines",
            140, new BigDecimal("149"), 28, new BigDecimal("399"), 0, new BigDecimal("0"));

        createFlight("SW420", "Dallas", "DAL", "Denver", "DEN",
            LocalDateTime.now().plusDays(3).withHour(16).withMinute(0),
            LocalDateTime.now().plusDays(3).withHour(17).withMinute(45),
            "Boeing 737", "Southwest Airlines",
            143, new BigDecimal("129"), 0, new BigDecimal("0"), 0, new BigDecimal("0"));

        createFlight("AA102", "Los Angeles", "LAX", "New York", "JFK",
            LocalDateTime.now().plusDays(5).withHour(9).withMinute(0),
            LocalDateTime.now().plusDays(5).withHour(17).withMinute(30),
            "Boeing 777", "American Airlines",
            200, new BigDecimal("299"), 42, new BigDecimal("699"), 14, new BigDecimal("1299"));

        log.info("Sample flights seeded successfully");
    }

    private void createFlight(String number, String origin, String originCode,
                               String dest, String destCode,
                               LocalDateTime dep, LocalDateTime arr,
                               String aircraft, String airline,
                               int econSeats, BigDecimal econPrice,
                               int bizSeats, BigDecimal bizPrice,
                               int firstSeats, BigDecimal firstPrice) {
        try {
            AdminFlightRequest req = new AdminFlightRequest();
            req.setFlightNumber(number);
            req.setOrigin(origin);
            req.setOriginCode(originCode);
            req.setDestination(dest);
            req.setDestinationCode(destCode);
            req.setDepartureTime(dep);
            req.setArrivalTime(arr);
            req.setAircraft(aircraft);
            req.setAirline(airline);
            req.setEconomySeats(econSeats);
            req.setEconomyPrice(econPrice);
            req.setBusinessSeats(bizSeats);
            req.setBusinessPrice(bizPrice);
            req.setFirstSeats(firstSeats);
            req.setFirstPrice(firstPrice);
            flightService.createFlight(req);
        } catch (Exception e) {
            log.warn("Could not seed flight {}: {}", number, e.getMessage());
        }
    }
}
