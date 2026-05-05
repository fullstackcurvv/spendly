# Plan: 01-Database-Setup

## Context

Establish the data layer foundation for the Spendly Spring Boot backend. The `backend/` directory is currently empty. This step creates the Maven project, all model/repository classes, seed data, and profile-specific configuration — everything future features (auth, expense CRUD) will depend on.

Spec source: `.claude/specs/01-database-setup.md`

---

## Implementation Sequence

Execute in this order to avoid compilation dependency failures:

1. `backend/pom.xml`
2. `SpendlyApplication.java`
3. `model/ExpenseCategory.java`
4. `model/User.java`, `model/Expense.java` (plain POJOs)
5. `model/jpa/JpaUser.java`, `model/jpa/JpaExpense.java`
6. `model/mongo/MongoUser.java`, `model/mongo/MongoExpense.java`
7. `repository/UserRepository.java`, `repository/ExpenseRepository.java` (interfaces)
8. All 4 PostgreSQL repository files
9. All 4 SQL Server repository files (mirror PostgreSQL, different package + `@Profile`)
10. All 4 MongoDB repository files
11. `config/JpaConfig.java`, `config/MongoConfig.java`
12. `config/AppConfig.java` (BCryptPasswordEncoder bean)
13. `config/DataSeeder.java`
14. 4 application yml files
15. `SpendlyApplicationTests.java`

---

## Files to Create

### `backend/pom.xml`
Spring Boot 3.3.0 parent, Java 17. Dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-data-mongodb`
- `postgresql` (runtime)
- `mssql-jdbc` (runtime)
- `spring-security-crypto` (BCrypt only — no security filters)
- `lombok` (optional)
- `spring-boot-starter-validation`
- `spring-boot-starter-test` (test scope)

### `SpendlyApplication.java`
Package: `com.spendly`
`@SpringBootApplication` excluding `JpaRepositoriesAutoConfiguration` and `MongoRepositoriesAutoConfiguration` — profile-specific `@Configuration` classes handle repository scanning instead of global auto-detection.

### `model/ExpenseCategory.java`
Enum with 7 values: `FOOD, TRANSPORT, BILLS, HEALTH, ENTERTAINMENT, SHOPPING, OTHER`

### `model/User.java` (plain POJO)
Fields: `String id`, `String name`, `String email`, `String passwordHash`, `LocalDateTime createdAt`
All IDs are `String` across all profiles (SQL longs become `"1"`, `"2"`; MongoDB uses ObjectId hex).

### `model/Expense.java` (plain POJO)
Fields: `String id`, `String userId`, `BigDecimal amount`, `ExpenseCategory category`, `String date` (YYYY-MM-DD), `String description`, `LocalDateTime createdAt`
Use `BigDecimal` for `amount` — not `double`.

### `model/jpa/JpaUser.java`
`@Entity @Table(name="users")`, `@UniqueConstraint(columnNames="email")`, `@GeneratedValue(strategy=IDENTITY)`, `@PrePersist` sets `createdAt`.

### `model/jpa/JpaExpense.java`
`@Entity @Table(name="expenses")`, `userId` as plain `Long` column, `@Enumerated(EnumType.STRING)` on category, `@PrePersist` sets `createdAt`.

### `model/mongo/MongoUser.java`
`@Document(collection="users")`, `@Indexed(unique=true)` on email.

### `model/mongo/MongoExpense.java`
`@Document(collection="expenses")`, `category` stored as `String` (enum name), `userId` as `String` (ObjectId hex reference).

### `repository/UserRepository.java`
Plain Java interface (no Spring Data imports). Methods:
```
User save(User user)
Optional<User> findById(String id)
Optional<User> findByEmail(String email)
List<User> findAll()
void deleteById(String id)
boolean existsByEmail(String email)
```

### `repository/ExpenseRepository.java`
Plain Java interface. Methods:
```
Expense save(Expense expense)
Optional<Expense> findById(String id)
List<Expense> findByUserId(String userId)
List<Expense> findByUserIdAndCategory(String userId, ExpenseCategory category)
List<Expense> findAll()
void deleteById(String id)
long countByUserId(String userId)
```

### PostgreSQL (package `com.spendly.repository.postgresql`, `@Profile("postgresql")`)
- `PostgresUserJpaRepository` — `extends JpaRepository<JpaUser, Long>`, adds `findByEmail`, `existsByEmail`
- `PostgresUserRepository` — `@Repository @Profile("postgresql") implements UserRepository`, wraps above, converts `JpaUser ↔ User`
- `PostgresExpenseJpaRepository` — `extends JpaRepository<JpaExpense, Long>`, adds `findByUserId`, `findByUserIdAndCategory`, `countByUserId`
- `PostgresExpenseRepository` — `@Repository @Profile("postgresql") implements ExpenseRepository`, converts `JpaExpense ↔ Expense`

### SQL Server (package `com.spendly.repository.sqlserver`, `@Profile("sqlserver")`)
Structurally identical to PostgreSQL. Only package name and `@Profile` annotation differ.
- `SqlServerUserJpaRepository`, `SqlServerUserRepository`
- `SqlServerExpenseJpaRepository`, `SqlServerExpenseRepository`

### MongoDB (package `com.spendly.repository.mongodb`, `@Profile("mongodb")`)
- `MongoUserMongoRepository` — `extends MongoRepository<MongoUser, String>`, adds `findByEmail`, `existsByEmail`
- `MongoUserRepository` — `@Repository @Profile("mongodb") implements UserRepository`, converts `MongoUser ↔ User`
- `MongoExpenseMongoRepository` — `extends MongoRepository<MongoExpense, String>`, adds `findByUserId(String)`, `findByUserIdAndCategory(String, String)`, `countByUserId`
- `MongoExpenseRepository` — `@Repository @Profile("mongodb") implements ExpenseRepository`, converts enum↔String in `toEntity`/`toModel`

### `config/JpaConfig.java`
```java
@Configuration
@Profile({"postgresql", "sqlserver"})
@EnableJpaRepositories(basePackages = {
    "com.spendly.repository.postgresql",
    "com.spendly.repository.sqlserver"
})
```
Scopes JPA repository scanning to SQL profiles only.

### `config/MongoConfig.java`
```java
@Configuration
@Profile("mongodb")
@EnableMongoRepositories(basePackages = "com.spendly.repository.mongodb")
```

### `config/AppConfig.java`
`@Configuration` with `@Bean BCryptPasswordEncoder passwordEncoder()`.

### `config/DataSeeder.java`
`implements ApplicationRunner`. Logic:
1. Check `userRepository.existsByEmail("demo@spendly.com")` — return early if true (idempotent)
2. Create demo user: name="Demo User", email="demo@spendly.com", password=BCrypt("demo1234")
3. Save user, capture returned `String id`
4. Insert 8 expenses covering all 7 categories (Food appears twice) with `BigDecimal` amounts and `2024-01-*` dates
5. Log completion

### `application.yml` (base)
Default profile: `postgresql`. Server on port 8080, context-path `/api`.

### `application-postgresql.yml`
DataSource url `jdbc:postgresql://localhost:5432/spendly`, `ddl-auto: update`, exclude Mongo auto-configs.

### `application-sqlserver.yml`
DataSource url `jdbc:sqlserver://localhost:1433;databaseName=spendly;encrypt=true;trustServerCertificate=true`, `ddl-auto: update`, exclude Mongo auto-configs.

### `application-mongodb.yml`
`spring.data.mongodb.uri: mongodb://localhost:27017/spendly`, exclude `DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration`, `JpaRepositoriesAutoConfiguration`.

### `SpendlyApplicationTests.java`
`@SpringBootTest @ActiveProfiles("postgresql")` with a single `contextLoads()` test.

---

## Critical Design Notes

**`@Profile` on interfaces is ineffective.** Spring Data creates proxy beans regardless of profile. The `JpaConfig`/`MongoConfig` `@EnableXxxRepositories` approach is the correct enforcement mechanism.

**MongoDB profile must exclude JPA auto-configs** in its yml — otherwise Spring Boot throws `Failed to configure a DataSource` on startup.

**SQL profiles must exclude MongoDB auto-configs** in their ymls — otherwise `MongoClient` is required.

**FK constraint on expenses.user_id:** `ddl-auto: update` will NOT auto-create a FK from `userId Long` alone. For this task, the application-level ordering in `DataSeeder` (save user first, use returned id) is sufficient.

---

## Verification

1. Run `mvn clean compile` from `backend/` — must produce zero errors
2. Start with `mvn spring-boot:run -Dspring-boot.run.profiles=postgresql` (requires local PostgreSQL at localhost:5432/spendly)
3. Check logs for "Seed complete: 1 user, 8 expenses."
4. Run again — logs must show "Seed data already present — skipping." (idempotency check)
5. Repeat steps 2-4 with `-Dspring-boot.run.profiles=mongodb` against a local MongoDB instance
6. `mvn test` — `contextLoads()` must pass
