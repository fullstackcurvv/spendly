package com.spendly.service;

import com.spendly.dto.ExpenseCategoryDto;
import com.spendly.dto.ExpenseResponseDto;
import com.spendly.dto.ExpenseSummaryDto;

import java.util.List;

public interface ExpenseService {
    // [SUBAGENT-1] transaction history
    List<ExpenseResponseDto> getExpensesForUser(String userId, String startDate, String endDate);

    // [SUBAGENT-2] summary stats
    ExpenseSummaryDto getSummaryForUser(String userId);

    // [SUBAGENT-3] category breakdown
    List<ExpenseCategoryDto> getCategoryBreakdownForUser(String userId);
}
