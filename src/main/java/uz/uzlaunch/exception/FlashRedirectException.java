package uz.uzlaunch.exception;

public class FlashRedirectException extends RuntimeException {

    private final String redirectUrl;
    private final String flashKey;

    public FlashRedirectException(String message, String redirectUrl) {
        this(message, redirectUrl, "error");
    }

    public FlashRedirectException(String message, String redirectUrl, String flashKey) {
        super(message);
        this.redirectUrl = redirectUrl;
        this.flashKey = flashKey;
    }

    public String getRedirectUrl() { return redirectUrl; }
    public String getFlashKey() { return flashKey; }
}
