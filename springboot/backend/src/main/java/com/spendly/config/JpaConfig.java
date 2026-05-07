package com.spendly.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@Profile({"postgresql", "sqlserver"})
@EnableJpaRepositories(basePackages = {
    "com.spendly.repository.postgresql",
    "com.spendly.repository.sqlserver"
})
public class JpaConfig {
}
