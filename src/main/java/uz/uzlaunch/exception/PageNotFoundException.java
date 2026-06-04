package uz.uzlaunch.exception;

public class PageNotFoundException extends RuntimeException {
    public PageNotFoundException() { super("Page not found"); }
}
