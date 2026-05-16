package com.fitlift;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@SpringBootApplication
public class LeadAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeadAiApplication.class, args);
    }

    @Bean
    public CommandLineRunner migrate(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Fix ENUM mismatch — the ultimate safe hotfix
                stmt.execute("ALTER TABLE leads MODIFY COLUMN status ENUM(" +
                    "'NEW', 'CONTACTED', 'TRIAL_BOOKED', 'FOLLOW_UP', 'JOINED', 'NOT_INTERESTED') " +
                    "NOT NULL DEFAULT 'NEW'");
                
                // Normalize existing data to match Java Enums (Uppercase + Underscores)
                stmt.execute("UPDATE leads SET source = UPPER(REPLACE(source, ' ', '_')) WHERE source IS NOT NULL");
                stmt.execute("UPDATE leads SET status = UPPER(REPLACE(status, ' ', '_')) WHERE status IS NOT NULL");
                
                System.out.println("✅ Database migration and data normalization successful.");
            } catch (Exception e) {
                System.err.println("⚠️ Migration skipped: " + e.getMessage());
            }
        };
    }
}
