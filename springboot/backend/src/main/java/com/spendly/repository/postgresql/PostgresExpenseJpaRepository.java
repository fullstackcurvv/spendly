package com.spendly.repository.postgresql;

import com.spendly.model.ExpenseCategory;
import com.spendly.model.jpa.JpaExpense;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

@Profile("postgresql")
public interface PostgresExpenseJpaRepository extends JpaRepository<JpaExpense, Long> {
    List<JpaExpense> findByUserId(Long userId);
    List<JpaExpense> findByUserIdAndCategory(Long userId, ExpenseCategory category);
    long countByUserId(Long userId);
}
