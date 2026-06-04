package uz.uzlaunch.exception;

public class SubscribeRateLimitedException extends FlashRedirectException {
    public SubscribeRateLimitedException(String slug) {
        super("Too many requests. Please try again later.", "/p/" + slug, "message");
    }
}
