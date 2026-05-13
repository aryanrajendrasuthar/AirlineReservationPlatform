package com.airline.reservation.service;

import com.airline.reservation.kafka.BookingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendBookingConfirmation(BookingEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(event.getUserEmail());
            helper.setSubject("Booking Confirmed - " + event.getBookingReference());
            helper.setText(buildConfirmationHtml(event), true);
            mailSender.send(message);
            log.info("Confirmation email sent to {}", event.getUserEmail());
        } catch (Exception e) {
            log.error("Error sending email: {}", e.getMessage());
        }
    }

    private String buildConfirmationHtml(BookingEvent event) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden;">
                <div style="background: #003087; color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0;">✈ Booking Confirmed</h1>
                </div>
                <div style="padding: 30px;">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your booking has been confirmed!</p>
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #003087; margin-top: 0;">Booking Details</h3>
                    <p><strong>Reference:</strong> %s</p>
                    <p><strong>Flight:</strong> %s</p>
                    <p><strong>Route:</strong> %s → %s</p>
                    <p><strong>Departure:</strong> %s</p>
                    <p><strong>Seats:</strong> %s</p>
                    <p><strong>Total:</strong> $%.2f</p>
                  </div>
                  <p style="color: #666;">Thank you for flying with us!</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                event.getUserName(),
                event.getBookingReference(),
                event.getFlightNumber(),
                event.getOrigin(),
                event.getDestination(),
                event.getDepartureTime(),
                String.join(", ", event.getSeats()),
                event.getTotalPrice()
        );
    }
}
