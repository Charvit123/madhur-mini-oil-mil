package in.madhuroil.customer.service;

/**
 * Swap the dev logger below (DevSmsSender) for a real client — MSG91, Twilio,
 * AWS SNS — by implementing this interface and marking it @Primary. Nothing
 * in AuthService changes.
 */
public interface SmsSender {
    void sendOtp(String phone, String code);
}
