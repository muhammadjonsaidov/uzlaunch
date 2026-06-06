package uz.uzlaunch.exception;

public class EmailNotVerifiedException extends FlashRedirectException {
    public EmailNotVerifiedException() {
        super("Please verify your email before logging in.", "/login");
    }
}
