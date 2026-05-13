package com.airline.reservation.kafka;

import com.airline.reservation.config.KafkaConfig;
import com.airline.reservation.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingEventConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = KafkaConfig.BOOKING_REQUESTS_TOPIC, groupId = "airline-group")
    public void handleBookingRequest(BookingEvent event) {
        log.info("Received booking request: reference={} userId={}", event.getBookingReference(), event.getUserId());
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_CONFIRMED_TOPIC, groupId = "airline-group")
    public void handleBookingConfirmed(BookingEvent event) {
        log.info("Booking confirmed: reference={}", event.getBookingReference());
        try {
            emailService.sendBookingConfirmation(event);
        } catch (Exception e) {
            log.error("Failed to send confirmation email for booking {}: {}", event.getBookingReference(), e.getMessage());
        }
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_FAILED_TOPIC, groupId = "airline-group")
    public void handleBookingFailed(BookingEvent event) {
        log.warn("Booking failed: reference={} status={}", event.getBookingReference(), event.getStatus());
    }
}
