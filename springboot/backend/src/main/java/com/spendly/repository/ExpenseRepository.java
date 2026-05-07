package com.spendly.repository;

import com.spendly.model.Expense;
import com.spendly.model.ExpenseCategory;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository {

    Expense save(Expense expense);

    Optional<Expense> findById(String id);

    List<Expense> findByUserId(String userId);

    List<Expense> findByUserIdAndCategory(String userId, ExpenseCategory category);

    List<Expense> findAll();

    void deleteById(String id);

    long countByUserId(String userId);
}
