package com.spendly.repository;

import com.spendly.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    User save(User user);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    List<User> findAll();

    void deleteById(String id);

    boolean existsByEmail(String email);
}
