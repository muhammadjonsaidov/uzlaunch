package uz.uzlaunch.exception;

public class AwaitingConfirmationException extends FlashRedirectException {
    public AwaitingConfirmationException(String slug) {
        super("Check your inbox — a confirmation email is on its way!", "/p/" + slug, "message");
    }
}
