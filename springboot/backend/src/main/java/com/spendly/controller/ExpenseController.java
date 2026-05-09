package com.spendly.controller;

import com.spendly.dto.ExpenseCategoryDto;
import com.spendly.dto.ExpenseResponseDto;
import com.spendly.dto.ExpenseSummaryDto;
import com.spendly.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> getExpenses(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        for (String d : new String[]{startDate, endDate}) {
            if (d != null) {
                try { LocalDate.parse(d); }
                catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid date format. Use YYYY-MM-DD."));
                }
            }
        }
        return ResponseEntity.ok(expenseService.getExpensesForUser(currentUserId(), startDate, endDate));
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
