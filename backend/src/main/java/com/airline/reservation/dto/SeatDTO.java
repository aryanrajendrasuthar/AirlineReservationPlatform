package com.airline.reservation.dto;

import com.airline.reservation.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDTO {
    private Long id;
    private String seatNumber;
    private Seat.SeatClass seatClass;
    private BigDecimal price;
    private Seat.SeatStatus status;

    public static SeatDTO from(Seat seat) {
        return SeatDTO.builder()
            .id(seat.getId())
            .seatNumber(seat.getSeatNumber())
            .seatClass(seat.getSeatClass())
            .price(seat.getPrice())
            .status(seat.getStatus())
            .build();
    }
}
