package com.airline.reservation.repository;

import com.airline.reservation.entity.Flight;
import com.airline.reservation.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("""
        SELECT DISTINCT f FROM Flight f
        WHERE LOWER(f.originCode) = LOWER(:origin)
          AND LOWER(f.destinationCode) = LOWER(:destination)
          AND f.departureTime >= :startOfDay
          AND f.departureTime < :endOfDay
          AND f.status != 'CANCELLED'
        ORDER BY f.departureTime
    """)
    List<Flight> searchFlights(
        @Param("origin") String origin,
        @Param("destination") String destination,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
        SELECT f FROM Flight f
        WHERE f.status != 'CANCELLED'
        ORDER BY f.departureTime
    """)
    List<Flight> findAllActive();

    @Query("""
        SELECT COUNT(s) FROM Seat s
        WHERE s.flight.id = :flightId
          AND s.seatClass = :seatClass
          AND s.status = 'AVAILABLE'
    """)
    long countAvailableSeats(
        @Param("flightId") Long flightId,
        @Param("seatClass") Seat.SeatClass seatClass
    );
}
