package com.spendly.repository.sqlserver;

import com.spendly.model.User;
import com.spendly.model.jpa.JpaUser;
import com.spendly.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("sqlserver")
public class SqlServerUserRepository implements UserRepository {

    private final SqlServerUserJpaRepository jpaRepository;

    public SqlServerUserRepository(SqlServerUserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User user) {
        return toModel(jpaRepository.save(toEntity(user)));
    }

    @Override
    public Optional<User> findById(String id) {
        return jpaRepository.findById(Long.parseLong(id)).map(this::toModel);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(this::toModel);
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll().stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(Long.parseLong(id));
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    private JpaUser toEntity(User m) {
        JpaUser e = new JpaUser();
        if (m.getId() != null && !m.getId().isEmpty()) {
            e.setId(Long.parseLong(m.getId()));
        }
        e.setName(m.getName());
        e.setEmail(m.getEmail());
        e.setPasswordHash(m.getPasswordHash());
        e.setCreatedAt(m.getCreatedAt());
        return e;
    }

    private User toModel(JpaUser e) {
        User m = new User();
        m.setId(String.valueOf(e.getId()));
        m.setName(e.getName());
        m.setEmail(e.getEmail());
        m.setPasswordHash(e.getPasswordHash());
        m.setCreatedAt(e.getCreatedAt());
        return m;
    }
}
