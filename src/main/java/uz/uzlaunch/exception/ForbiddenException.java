package uz.uzlaunch.exception;

public class ForbiddenException extends FlashRedirectException {
    public ForbiddenException(String message) {
        super(message, "/dashboard");
    }
}
