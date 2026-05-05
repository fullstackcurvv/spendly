package com.spendly.repository.mongodb;

import com.spendly.model.mongo.MongoUser;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

@Profile("mongodb")
public interface MongoUserMongoRepository extends MongoRepository<MongoUser, String> {
    Optional<MongoUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
