package com.airline.reservation.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String bookingRef) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountInCents)
            .setCurrency(currency.toLowerCase())
            .putMetadata("booking_reference", bookingRef)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();
        return PaymentIntent.create(params);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    public boolean isPaymentSucceeded(String paymentIntentId) {
        try {
            PaymentIntent pi = retrievePaymentIntent(paymentIntentId);
            return "succeeded".equals(pi.getStatus());
        } catch (StripeException e) {
            log.error("Error checking payment status: {}", e.getMessage());
            return false;
        }
    }
}
