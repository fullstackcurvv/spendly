package com.spendly.config;

import com.spendly.model.Expense;
import com.spendly.model.ExpenseCategory;
import com.spendly.model.User;
import com.spendly.repository.ExpenseRepository;
import com.spendly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String DEMO_EMAIL = "demo@spendly.com";
    private static final String DEMO_NAME  = "Demo User";
    private static final String DEMO_PASS  = "demo1234";

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ExpenseRepository expenseRepository,
                      BCryptPasswordEncoder passwordEncoder) {
        this.userRepository    = userRepository;
        this.expenseRepository = expenseRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            log.info("Seed data already present — skipping.");
            return;
        }

        log.info("Seeding demo data...");

        User demoUser = new User();
        demoUser.setName(DEMO_NAME);
        demoUser.setEmail(DEMO_EMAIL);
        demoUser.setPasswordHash(passwordEncoder.encode(DEMO_PASS));
        demoUser.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(demoUser);
        String userId = savedUser.getId();

        List<Expense> expenses = List.of(
            expense(userId, "49.99",  ExpenseCategory.FOOD,          "2024-01-05", "Weekly groceries"),
            expense(userId, "12.50",  ExpenseCategory.TRANSPORT,     "2024-01-06", "Bus monthly pass"),
            expense(userId, "120.00", ExpenseCategory.BILLS,         "2024-01-07", "Electricity bill"),
            expense(userId, "35.00",  ExpenseCategory.HEALTH,        "2024-01-10", "Pharmacy"),
            expense(userId, "15.99",  ExpenseCategory.ENTERTAINMENT, "2024-01-12", "Netflix subscription"),
            expense(userId, "89.95",  ExpenseCategory.SHOPPING,      "2024-01-14", "Shoes"),
            expense(userId, "5.50",   ExpenseCategory.OTHER,         "2024-01-15", "Parking meter"),
            expense(userId, "22.30",  ExpenseCategory.FOOD,          "2024-01-18", "Restaurant lunch")
        );

        expenses.forEach(expenseRepository::save);

        log.info("Seed complete: 1 user, {} expenses.", expenses.size());
    }

    private Expense expense(String userId, String amount, ExpenseCategory category,
                            String date, String description) {
        Expense e = new Expense();
        e.setUserId(userId);
        e.setAmount(new BigDecimal(amount));
        e.setCategory(category);
        e.setDate(date);
        e.setDescription(description);
        e.setCreatedAt(LocalDateTime.now());
        return e;
    }
}
