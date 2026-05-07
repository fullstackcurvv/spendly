package com.spendly.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@Profile("mongodb")
@EnableMongoRepositories(basePackages = "com.spendly.repository.mongodb")
public class MongoConfig {
}
