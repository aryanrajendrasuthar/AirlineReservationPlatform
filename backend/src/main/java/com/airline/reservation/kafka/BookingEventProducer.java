package com.airline.reservation.kafka;

import com.airline.reservation.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingEventProducer {

    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public void publishBookingRequest(BookingEvent event) {
        publish(KafkaConfig.BOOKING_REQUESTS_TOPIC, event);
    }

    public void publishBookingConfirmed(BookingEvent event) {
        publish(KafkaConfig.BOOKING_CONFIRMED_TOPIC, event);
    }

    public void publishBookingFailed(BookingEvent event) {
        publish(KafkaConfig.BOOKING_FAILED_TOPIC, event);
    }

    private void publish(String topic, BookingEvent event) {
        CompletableFuture<SendResult<String, BookingEvent>> future =
            kafkaTemplate.send(topic, event.getBookingReference(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Kafka event published to [{}] reference={} offset={}",
                    topic, event.getBookingReference(),
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to publish Kafka event to [{}]: {}", topic, ex.getMessage());
            }
        });
    }
}
