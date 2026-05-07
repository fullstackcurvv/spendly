package com.spendly.dto;

import java.time.LocalDateTime;

public class UserResponseDto {

    private final String id;
    private final String name;
    private final String email;
    private final LocalDateTime createdAt;

    public UserResponseDto(String id, String name, String email, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
