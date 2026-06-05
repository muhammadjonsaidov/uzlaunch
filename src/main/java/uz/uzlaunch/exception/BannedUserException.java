package uz.uzlaunch.exception;

public class BannedUserException extends FlashRedirectException {
    public BannedUserException() {
        super("Your account has been suspended. Contact support.", "/login");
    }
}
