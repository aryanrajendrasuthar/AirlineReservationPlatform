package com.airline.reservation.dto;

import com.airline.reservation.entity.Flight;
import com.airline.reservation.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightDTO {
    private Long id;
    private String flightNumber;
    private String origin;
    private String originCode;
    private String destination;
    private String destinationCode;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private long durationMinutes;
    private String aircraft;
    private String airline;
    private Flight.FlightStatus status;
    private Map<String, SeatClassInfo> seatClasses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatClassInfo {
        private BigDecimal price;
        private int available;
        private int total;
    }

    public static class SearchRequest {
        private String origin;
        private String destination;
        private String date;
        private int passengers;
        private Seat.SeatClass seatClass;

        public String getOrigin() { return origin; }
        public void setOrigin(String origin) { this.origin = origin; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public int getPassengers() { return passengers; }
        public void setPassengers(int passengers) { this.passengers = passengers; }
        public Seat.SeatClass getSeatClass() { return seatClass; }
        public void setSeatClass(Seat.SeatClass seatClass) { this.seatClass = seatClass; }
    }
}
