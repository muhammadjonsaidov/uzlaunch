package uz.uzlaunch.exception;

public class AlreadySubscribedException extends FlashRedirectException {
    public AlreadySubscribedException(String slug) {
        super("You're already on the waitlist!", "/p/" + slug, "message");
    }
}
