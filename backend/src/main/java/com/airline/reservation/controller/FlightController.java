package com.airline.reservation.controller;

import com.airline.reservation.dto.FlightDTO;
import com.airline.reservation.dto.SeatDTO;
import com.airline.reservation.entity.Seat;
import com.airline.reservation.service.FlightService;
import com.airline.reservation.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<List<FlightDTO>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightDTO>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int passengers,
            @RequestParam(required = false) Seat.SeatClass seatClass) {
        return ResponseEntity.ok(flightService.searchFlights(origin, destination, date, passengers, seatClass));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDTO> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatDTO>> getSeats(@PathVariable Long id) {
        return ResponseEntity.ok(seatService.getSeatsForFlight(id));
    }
}
