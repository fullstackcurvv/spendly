package com.spendly.service;

import com.spendly.dto.RegisterRequestDto;
import com.spendly.dto.UserResponseDto;

public interface UserService {

    UserResponseDto register(RegisterRequestDto request);
}
