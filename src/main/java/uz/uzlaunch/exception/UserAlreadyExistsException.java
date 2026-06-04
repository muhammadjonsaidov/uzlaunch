package uz.uzlaunch.exception;

public class UserAlreadyExistsException extends FlashRedirectException {
    public UserAlreadyExistsException() {
        super("This email is already registered", "/register");
    }
}
