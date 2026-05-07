package com.spendly.repository.mongodb;

import com.spendly.model.User;
import com.spendly.model.mongo.MongoUser;
import com.spendly.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("mongodb")
public class MongoUserRepository implements UserRepository {

    private final MongoUserMongoRepository mongoRepository;

    public MongoUserRepository(MongoUserMongoRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public User save(User user) {
        return toModel(mongoRepository.save(toEntity(user)));
    }

    @Override
    public Optional<User> findById(String id) {
        return mongoRepository.findById(id).map(this::toModel);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return mongoRepository.findByEmail(email).map(this::toModel);
    }

    @Override
    public List<User> findAll() {
        return mongoRepository.findAll().stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        mongoRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return mongoRepository.existsByEmail(email);
    }

    private MongoUser toEntity(User m) {
        MongoUser e = new MongoUser();
        e.setId(m.getId());
        e.setName(m.getName());
        e.setEmail(m.getEmail());
        e.setPasswordHash(m.getPasswordHash());
        e.setCreatedAt(m.getCreatedAt());
        return e;
    }

    private User toModel(MongoUser e) {
        User m = new User();
        m.setId(e.getId());
        m.setName(e.getName());
        m.setEmail(e.getEmail());
        m.setPasswordHash(e.getPasswordHash());
        m.setCreatedAt(e.getCreatedAt());
        return m;
    }
}
