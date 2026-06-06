package uz.uzlaunch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UzLaunchApplication {
    public static void main(String[] args) {
        SpringApplication.run(UzLaunchApplication.class, args);
    }
}
