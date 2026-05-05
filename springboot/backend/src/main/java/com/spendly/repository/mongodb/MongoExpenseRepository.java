package com.spendly.repository.mongodb;

import com.spendly.model.Expense;
import com.spendly.model.ExpenseCategory;
import com.spendly.model.mongo.MongoExpense;
import com.spendly.repository.ExpenseRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("mongodb")
public class MongoExpenseRepository implements ExpenseRepository {

    private final MongoExpenseMongoRepository mongoRepository;

    public MongoExpenseRepository(MongoExpenseMongoRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public Expense save(Expense expense) {
        return toModel(mongoRepository.save(toEntity(expense)));
    }

    @Override
    public Optional<Expense> findById(String id) {
        return mongoRepository.findById(id).map(this::toModel);
    }

    @Override
    public List<Expense> findByUserId(String userId) {
        return mongoRepository.findByUserId(userId)
                .stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserIdAndCategory(String userId, ExpenseCategory category) {
        return mongoRepository.findByUserIdAndCategory(userId, category.name())
                .stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public List<Expense> findAll() {
        return mongoRepository.findAll().stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        mongoRepository.deleteById(id);
    }

    @Override
    public long countByUserId(String userId) {
        return mongoRepository.countByUserId(userId);
    }

    private MongoExpense toEntity(Expense m) {
        MongoExpense e = new MongoExpense();
        e.setId(m.getId());
        e.setUserId(m.getUserId());
        e.setAmount(m.getAmount());
        e.setCategory(m.getCategory() != null ? m.getCategory().name() : null);
        e.setDate(m.getDate());
        e.setDescription(m.getDescription());
        e.setCreatedAt(m.getCreatedAt());
        return e;
    }

    private Expense toModel(MongoExpense e) {
        Expense m = new Expense();
        m.setId(e.getId());
        m.setUserId(e.getUserId());
        m.setAmount(e.getAmount());
        m.setCategory(e.getCategory() != null ? ExpenseCategory.valueOf(e.getCategory()) : null);
        m.setDate(e.getDate());
        m.setDescription(e.getDescription());
        m.setCreatedAt(e.getCreatedAt());
        return m;
    }
}
