package com.spendly.repository.sqlserver;

import com.spendly.model.jpa.JpaUser;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Profile("sqlserver")
public interface SqlServerUserJpaRepository extends JpaRepository<JpaUser, Long> {
    Optional<JpaUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
