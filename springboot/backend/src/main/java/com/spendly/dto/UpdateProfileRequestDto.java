package com.spendly.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
