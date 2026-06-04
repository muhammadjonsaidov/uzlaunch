package uz.uzlaunch.exception;

public class ProjectNotFoundException extends FlashRedirectException {
    public ProjectNotFoundException() {
        super("Project not found", "/dashboard");
    }
}
