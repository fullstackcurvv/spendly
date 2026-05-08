package com.spendly.dto;

import java.math.BigDecimal;

public class ExpenseCategoryDto {
    private final String category;
    private final BigDecimal total;
    private final int percentage;

    public ExpenseCategoryDto(String category, BigDecimal total, int percentage) {
        this.category = category;
        this.total = total;
        this.percentage = percentage;
    }

    public String getCategory() { return category; }
    public BigDecimal getTotal() { return total; }
    public int getPercentage() { return percentage; }
}
