package com.spendly.repository.postgresql;

import com.spendly.model.jpa.JpaUser;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Profile("postgresql")
public interface PostgresUserJpaRepository extends JpaRepository<JpaUser, Long> {
    Optional<JpaUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
