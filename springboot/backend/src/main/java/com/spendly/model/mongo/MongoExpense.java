package com.spendly.model.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "expenses")
public class MongoExpense {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("amount")
    private BigDecimal amount;

    @Field("category")
    private String category;

    @Field("date")
    private String date;

    @Field("description")
    private String description;

    @Field("created_at")
    private LocalDateTime createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
