package com.airline.reservation.dto;

import com.airline.reservation.entity.Booking;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequest {

    @NotNull
    private Long flightId;

    @NotEmpty
    private List<String> selectedSeats;

    @NotEmpty
    @Valid
    private List<PassengerInfo> passengers;

    private Booking.TripType tripType = Booking.TripType.ONE_WAY;

    @Data
    public static class PassengerInfo {
        @NotBlank
        private String name;
        @NotBlank
        private String email;
        @NotBlank
        private String passport;
        @NotNull
        private LocalDate dob;
        @NotBlank
        private String seatNumber;
    }
}
