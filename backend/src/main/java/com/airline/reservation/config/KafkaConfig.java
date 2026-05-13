package com.airline.reservation.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String BOOKING_REQUESTS_TOPIC = "booking-requests";
    public static final String BOOKING_CONFIRMED_TOPIC = "booking-confirmed";
    public static final String BOOKING_FAILED_TOPIC = "booking-failed";

    @Bean
    public NewTopic bookingRequestsTopic() {
        return TopicBuilder.name(BOOKING_REQUESTS_TOPIC)
            .partitions(3)
            .replicas(1)
            .build();
    }

    @Bean
    public NewTopic bookingConfirmedTopic() {
        return TopicBuilder.name(BOOKING_CONFIRMED_TOPIC)
            .partitions(3)
            .replicas(1)
            .build();
    }

    @Bean
    public NewTopic bookingFailedTopic() {
        return TopicBuilder.name(BOOKING_FAILED_TOPIC)
            .partitions(3)
            .replicas(1)
            .build();
    }
}
