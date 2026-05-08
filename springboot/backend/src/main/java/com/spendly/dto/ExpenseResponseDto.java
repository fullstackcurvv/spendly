package com.spendly.dto;

import java.math.BigDecimal;

public class ExpenseResponseDto {
    private final String id;
    private final String category;
    private final BigDecimal amount;
    private final String date;
    private final String description;

    public ExpenseResponseDto(String id, String category, BigDecimal amount, String date, String description) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.description = description;
    }

    public String getId() { return id; }
    public String getCategory() { return category; }
    public BigDecimal getAmount() { return amount; }
    public String getDate() { return date; }
    public String getDescription() { return description; }
}
