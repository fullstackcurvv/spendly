package com.spendly.repository.mongodb;

import com.spendly.model.mongo.MongoExpense;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

@Profile("mongodb")
public interface MongoExpenseMongoRepository extends MongoRepository<MongoExpense, String> {
    List<MongoExpense> findByUserId(String userId);
    List<MongoExpense> findByUserIdAndCategory(String userId, String category);
    long countByUserId(String userId);
    List<MongoExpense> findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(String userId, String startDate, String endDate);
}
