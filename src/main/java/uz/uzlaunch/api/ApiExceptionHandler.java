package uz.uzlaunch.api;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import uz.uzlaunch.api.dto.response.ErrorResponse;
import uz.uzlaunch.exception.*;

@RestControllerAdvice(basePackages = "uz.uzlaunch.api")
public class ApiExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handle(UserAlreadyExistsException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("USER_ALREADY_EXISTS", "Email already registered"));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handle(InvalidCredentialsException ex) {
        return ResponseEntity.status(401).body(new ErrorResponse("INVALID_CREDENTIALS", "Invalid email or password"));
    }

    @ExceptionHandler(BannedUserException.class)
    public ResponseEntity<ErrorResponse> handle(BannedUserException ex) {
        return ResponseEntity.status(403).body(new ErrorResponse("USER_BANNED", "Your account has been banned"));
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handle(EmailNotVerifiedException ex) {
        return ResponseEntity.status(403).body(new ErrorResponse("EMAIL_NOT_VERIFIED", "Please verify your email first"));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handle(ForbiddenException ex) {
        return ResponseEntity.status(403).body(new ErrorResponse("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(ProjectNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse("PROJECT_NOT_FOUND", "Project not found"));
    }

    @ExceptionHandler(PageNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(PageNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse("NOT_FOUND", "Resource not found"));
    }

    @ExceptionHandler(AlreadySubscribedException.class)
    public ResponseEntity<ErrorResponse> handle(AlreadySubscribedException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("ALREADY_SUBSCRIBED", "Already subscribed to this project"));
    }

    @ExceptionHandler(AwaitingConfirmationException.class)
    public ResponseEntity<ErrorResponse> handle(AwaitingConfirmationException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("AWAITING_CONFIRMATION", "Confirmation email already sent"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handle(BadRequestException ex) {
        return ResponseEntity.status(422).body(new ErrorResponse("BAD_REQUEST", ex.getMessage()));
    }

    @ExceptionHandler(SubscribeRateLimitedException.class)
    public ResponseEntity<ErrorResponse> handle(SubscribeRateLimitedException ex) {
        return ResponseEntity.status(429).body(new ErrorResponse("RATE_LIMITED", "Too many requests. Try again later."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handle(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse("Validation failed");
        return ResponseEntity.status(422).body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handle(ConstraintViolationException ex) {
        return ResponseEntity.status(422).body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handle(Exception ex) {
        return ResponseEntity.status(500).body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}