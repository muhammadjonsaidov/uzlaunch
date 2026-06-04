package uz.uzlaunch.web;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uz.uzlaunch.exception.FlashRedirectException;
import uz.uzlaunch.exception.PageNotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FlashRedirectException.class)
    public String handleFlash(FlashRedirectException e, RedirectAttributes ra) {
        String url = e.getRedirectUrl();
        if (!url.startsWith("/")) throw new IllegalStateException("Unsafe redirect: " + url);
        ra.addFlashAttribute(e.getFlashKey(), e.getMessage());
        return "redirect:" + url;
    }

    @ExceptionHandler(PageNotFoundException.class)
    public String handlePageNotFound() {
        return "error/404";
    }
}
