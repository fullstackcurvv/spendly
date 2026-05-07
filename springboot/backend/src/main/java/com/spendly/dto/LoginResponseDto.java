package com.spendly.dto;

public class LoginResponseDto {

    private final String token;
    private final String id;
    private final String name;
    private final String email;

    public LoginResponseDto(String token, String id, String name, String email) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public String getToken() { return token; }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
