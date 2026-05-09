package com.spendly.service.impl;

import com.spendly.dto.ExpenseCategoryDto;
import com.spendly.dto.ExpenseResponseDto;
import com.spendly.dto.ExpenseSummaryDto;
import com.spendly.model.Expense;
import com.spendly.model.ExpenseCategory;
import com.spendly.repository.ExpenseRepository;
import com.spendly.service.ExpenseService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    // ── [SUBAGENT-1] transaction history ─────────────────────────────────────
    @Override
    public List<ExpenseResponseDto> getExpensesForUser(String userId, String startDate, String endDate) {
        List<Expense> expenses;
        if (startDate != null && endDate != null) {
            expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        } else if (startDate != null) {
            expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, "9999-12-31");
        } else if (endDate != null) {
            expenses = expenseRepository.findByUserIdAndDateBetween(userId, "0000-01-01", endDate);
        } else {
            expenses = expenseRepository.findByUserId(userId);
        }
        return expenses.stream()
                .sorted(Comparator.comparing(Expense::getDate).reversed())
                .map(e -> new ExpenseResponseDto(
                        e.getId(),
                        e.getCategory().name(),
                        e.getAmount(),
                        e.getDate(),
                        e.getDescription()))
                .collect(Collectors.toList());
    }

    // ── [SUBAGENT-2] summary stats ───────────────────────────────────────────
    @Override
    public ExpenseSummaryDto getSummaryForUser(String userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        if (expenses.isEmpty()) {
            return new ExpenseSummaryDto(BigDecimal.ZERO, 0L, "—");
        }
        BigDecimal totalSpent = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = expenses.size();
        Map<ExpenseCategory, BigDecimal> byCategory = new EnumMap<>(ExpenseCategory.class);
        for (Expense e : expenses) {
            byCategory.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }
        String topCategory = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey().name())
                .orElse("—");
        return new ExpenseSummaryDto(totalSpent, count, topCategory);
    }

    // ── [SUBAGENT-3] category breakdown ─────────────────────────────────────
    @Override
    public List<ExpenseCategoryDto> getCategoryBreakdownForUser(String userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        if (expenses.isEmpty()) return Collections.emptyList();

        Map<ExpenseCategory, BigDecimal> byCategory = new EnumMap<>(ExpenseCategory.class);
        for (Expense e : expenses) {
            byCategory.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }
        BigDecimal grandTotal = byCategory.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map.Entry<ExpenseCategory, BigDecimal>> sorted = byCategory.entrySet().stream()
                .sorted(Map.Entry.<ExpenseCategory, BigDecimal>comparingByValue().reversed())
                .collect(Collectors.toList());

        int[] rawPcts = sorted.stream()
                .mapToInt(entry -> entry.getValue()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(grandTotal, 0, RoundingMode.FLOOR)
                        .intValue())
                .toArray();
        int remainder = 100 - Arrays.stream(rawPcts).sum();
        rawPcts[0] += remainder;

        List<ExpenseCategoryDto> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            result.add(new ExpenseCategoryDto(
                    sorted.get(i).getKey().name(),
                    sorted.get(i).getValue(),
                    rawPcts[i]));
        }
        return result;
    }
}
