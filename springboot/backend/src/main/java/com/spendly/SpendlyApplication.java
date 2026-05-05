package com.spendly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration;

@SpringBootApplication(exclude = {
    JpaRepositoriesAutoConfiguration.class,
    MongoRepositoriesAutoConfiguration.class
})
public class SpendlyApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpendlyApplication.class, args);
    }
}
