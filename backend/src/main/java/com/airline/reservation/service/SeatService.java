package com.airline.reservation.service;

import com.airline.reservation.dto.SeatDTO;
import com.airline.reservation.entity.Seat;
import com.airline.reservation.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatService {

    private static final String SEAT_LOCK_PREFIX = "seat:lock:";
    private static final Duration LOCK_TTL = Duration.ofMinutes(10);

    private final SeatRepository seatRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public List<SeatDTO> getSeatsForFlight(Long flightId) {
        List<Seat> seats = seatRepository.findByFlightIdOrderBySeatNumber(flightId);
        return seats.stream().map(seat -> {
            SeatDTO dto = SeatDTO.from(seat);
            if (dto.getStatus() == Seat.SeatStatus.AVAILABLE && isSeatLocked(flightId, seat.getSeatNumber())) {
                dto.setStatus(Seat.SeatStatus.LOCKED);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public boolean lockSeat(Long flightId, String seatNumber) {
        String key = buildLockKey(flightId, seatNumber);
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(key, "locked", LOCK_TTL);
        return Boolean.TRUE.equals(locked);
    }

    public void unlockSeat(Long flightId, String seatNumber) {
        redisTemplate.delete(buildLockKey(flightId, seatNumber));
    }

    public boolean isSeatLocked(Long flightId, String seatNumber) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(buildLockKey(flightId, seatNumber)));
    }

    @Transactional
    public void markSeatsBooked(Long flightId, List<String> seatNumbers) {
        seatNumbers.forEach(seatNumber -> {
            seatRepository.updateSeatStatus(flightId, seatNumber, Seat.SeatStatus.BOOKED);
            redisTemplate.delete(buildLockKey(flightId, seatNumber));
        });
    }

    @Transactional
    public void releaseSeats(Long flightId, List<String> seatNumbers) {
        seatNumbers.forEach(seatNumber -> {
            seatRepository.updateSeatStatus(flightId, seatNumber, Seat.SeatStatus.AVAILABLE);
            redisTemplate.delete(buildLockKey(flightId, seatNumber));
        });
    }

    private String buildLockKey(Long flightId, String seatNumber) {
        return SEAT_LOCK_PREFIX + flightId + ":" + seatNumber;
    }
}
