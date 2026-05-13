package com.airline.reservation.repository;

import com.airline.reservation.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByFlightIdOrderBySeatNumber(Long flightId);

    List<Seat> findByFlightIdAndSeatClass(Long flightId, Seat.SeatClass seatClass);

    Optional<Seat> findByFlightIdAndSeatNumber(Long flightId, String seatNumber);

    @Modifying
    @Query("UPDATE Seat s SET s.status = :status WHERE s.flight.id = :flightId AND s.seatNumber = :seatNumber")
    int updateSeatStatus(
        @Param("flightId") Long flightId,
        @Param("seatNumber") String seatNumber,
        @Param("status") Seat.SeatStatus status
    );

    @Query("SELECT s FROM Seat s WHERE s.flight.id = :flightId AND s.seatNumber IN :seatNumbers")
    List<Seat> findByFlightIdAndSeatNumberIn(
        @Param("flightId") Long flightId,
        @Param("seatNumbers") List<String> seatNumbers
    );
}
