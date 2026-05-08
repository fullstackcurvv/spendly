package com.spendly.dto;

import java.math.BigDecimal;

public class ExpenseSummaryDto {
    private final BigDecimal totalSpent;
    private final long transactionCount;
    private final String topCategory;

    public ExpenseSummaryDto(BigDecimal totalSpent, long transactionCount, String topCategory) {
        this.totalSpent = totalSpent;
        this.transactionCount = transactionCount;
        this.topCategory = topCategory;
    }

    public BigDecimal getTotalSpent() { return totalSpent; }
    public long getTransactionCount() { return transactionCount; }
    public String getTopCategory() { return topCategory; }
}
