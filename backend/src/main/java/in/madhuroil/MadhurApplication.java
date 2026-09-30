package in.madhuroil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling // powers OrderCleanupScheduler's abandoned-cart stock release
public class MadhurApplication {
    public static void main(String[] args) {
        SpringApplication.run(MadhurApplication.class, args);
    }
}
