package uz.uzlaunch.exception;

public class InvalidCredentialsException extends FlashRedirectException {
    public InvalidCredentialsException() {
        super("Invalid email or password", "/login");
    }
}
