package com.airline.reservation.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent {
    private String eventType;
    private Long bookingId;
    private String bookingReference;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long flightId;
    private String flightNumber;
    private String origin;
    private String destination;
    private String departureTime;
    private List<String> seats;
    private BigDecimal totalPrice;
    private String status;
    private String timestamp;
}
