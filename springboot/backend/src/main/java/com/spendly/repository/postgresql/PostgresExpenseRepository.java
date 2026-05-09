package com.spendly.repository.postgresql;

import com.spendly.model.Expense;
import com.spendly.model.ExpenseCategory;
import com.spendly.model.jpa.JpaExpense;
import com.spendly.repository.ExpenseRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("postgresql")
public class PostgresExpenseRepository implements ExpenseRepository {

    private final PostgresExpenseJpaRepository jpaRepository;

    public PostgresExpenseRepository(PostgresExpenseJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Expense save(Expense expense) {
        return toModel(jpaRepository.save(toEntity(expense)));
    }

    @Override
    public Optional<Expense> findById(String id) {
        return jpaRepository.findById(Long.parseLong(id)).map(this::toModel);
    }

    @Override
    public List<Expense> findByUserId(String userId) {
        return jpaRepository.findByUserId(Long.parseLong(userId))
                .stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserIdAndCategory(String userId, ExpenseCategory category) {
        return jpaRepository.findByUserIdAndCategory(Long.parseLong(userId), category)
                .stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public List<Expense> findAll() {
        return jpaRepository.findAll().stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(Long.parseLong(id));
    }

    @Override
    public long countByUserId(String userId) {
        return jpaRepository.countByUserId(Long.parseLong(userId));
    }

    @Override
    public List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate) {
        return jpaRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(Long.parseLong(userId), startDate, endDate)
                .stream().map(this::toModel).collect(Collectors.toList());
    }

    private JpaExpense toEntity(Expense m) {
        JpaExpense e = new JpaExpense();
        if (m.getId() != null && !m.getId().isEmpty()) {
            e.setId(Long.parseLong(m.getId()));
        }
        e.setUserId(Long.parseLong(m.getUserId()));
        e.setAmount(m.getAmount());
        e.setCategory(m.getCategory());
        e.setDate(m.getDate());
        e.setDescription(m.getDescription());
        e.setCreatedAt(m.getCreatedAt());
        return e;
    }

    private Expense toModel(JpaExpense e) {
        Expense m = new Expense();
        m.setId(String.valueOf(e.getId()));
        m.setUserId(String.valueOf(e.getUserId()));
        m.setAmount(e.getAmount());
        m.setCategory(e.getCategory());
        m.setDate(e.getDate());
        m.setDescription(e.getDescription());
        m.setCreatedAt(e.getCreatedAt());
        return m;
    }
}
