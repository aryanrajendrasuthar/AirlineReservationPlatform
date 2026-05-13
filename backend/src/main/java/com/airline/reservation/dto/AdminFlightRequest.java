package com.airline.reservation.dto;

import com.airline.reservation.entity.Flight;
import com.airline.reservation.entity.Seat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminFlightRequest {
    @NotBlank
    private String flightNumber;
    @NotBlank
    private String origin;
    @NotBlank
    private String originCode;
    @NotBlank
    private String destination;
    @NotBlank
    private String destinationCode;
    @NotNull
    private LocalDateTime departureTime;
    @NotNull
    private LocalDateTime arrivalTime;
    @NotBlank
    private String aircraft;
    @NotBlank
    private String airline;

    private Flight.FlightStatus status = Flight.FlightStatus.SCHEDULED;

    // Seat configuration
    private int economySeats = 120;
    private BigDecimal economyPrice;
    private int businessSeats = 30;
    private BigDecimal businessPrice;
    private int firstSeats = 10;
    private BigDecimal firstPrice;

    public Seat.SeatClass getSeatClassForRow(int row) {
        if (row <= firstSeats / 6) return Seat.SeatClass.FIRST;
        if (row <= (firstSeats + businessSeats) / 6) return Seat.SeatClass.BUSINESS;
        return Seat.SeatClass.ECONOMY;
    }
}
