package com.airline.reservation.controller;

import com.airline.reservation.dto.BookingDTO;
import com.airline.reservation.dto.BookingRequest;
import com.airline.reservation.entity.User;
import com.airline.reservation.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> initiateBooking(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.initiateBooking(user.getId(), request));
    }

    @PostMapping("/{reference}/confirm")
    public ResponseEntity<BookingDTO> confirmBooking(
            @AuthenticationPrincipal User user,
            @PathVariable String reference) {
        return ResponseEntity.ok(bookingService.confirmBooking(user.getId(), reference));
    }

    @PostMapping("/{reference}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @AuthenticationPrincipal User user,
            @PathVariable String reference) {
        return ResponseEntity.ok(bookingService.cancelBooking(user.getId(), reference));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    @GetMapping("/{reference}")
    public ResponseEntity<BookingDTO> getBooking(
            @AuthenticationPrincipal User user,
            @PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }
}
