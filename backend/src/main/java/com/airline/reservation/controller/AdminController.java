package com.airline.reservation.controller;

import com.airline.reservation.dto.AdminFlightRequest;
import com.airline.reservation.dto.BookingDTO;
import com.airline.reservation.dto.FlightDTO;
import com.airline.reservation.entity.Flight;
import com.airline.reservation.service.BookingService;
import com.airline.reservation.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final FlightService flightService;
    private final BookingService bookingService;

    // Flight management
    @GetMapping("/flights")
    public ResponseEntity<List<FlightDTO>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @PostMapping("/flights")
    public ResponseEntity<FlightDTO> createFlight(@Valid @RequestBody AdminFlightRequest request) {
        return ResponseEntity.ok(flightService.createFlight(request));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<FlightDTO> updateFlight(
            @PathVariable Long id,
            @Valid @RequestBody AdminFlightRequest request) {
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @PatchMapping("/flights/{id}/status")
    public ResponseEntity<FlightDTO> updateFlightStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(flightService.updateFlightStatus(id, Flight.FlightStatus.valueOf(status)));
    }

    @DeleteMapping("/flights/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    // Booking management
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
