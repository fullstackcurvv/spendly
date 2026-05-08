package com.spendly.controller;

import com.spendly.dto.ExpenseCategoryDto;
import com.spendly.dto.ExpenseResponseDto;
import com.spendly.dto.ExpenseSummaryDto;
import com.spendly.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    private String currentUserId() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── [SUBAGENT-1] GET /api/expenses ───────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ExpenseResponseDto>> getExpenses() {
        return ResponseEntity.ok(expenseService.getExpensesForUser(currentUserId()));
    }

    // ── [SUBAGENT-2] GET /api/expenses/summary ───────────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<ExpenseSummaryDto> getSummary() {
        return ResponseEntity.ok(expenseService.getSummaryForUser(currentUserId()));
    }

    // ── [SUBAGENT-3] GET /api/expenses/categories ────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseCategoryDto>> getCategoryBreakdown() {
        return ResponseEntity.ok(expenseService.getCategoryBreakdownForUser(currentUserId()));
    }
}
