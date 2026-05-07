package com.spendly.service;

import com.spendly.dto.LoginRequestDto;
import com.spendly.dto.LoginResponseDto;
import com.spendly.dto.RegisterRequestDto;
import com.spendly.dto.UserResponseDto;

public interface UserService {

    UserResponseDto register(RegisterRequestDto request);

    LoginResponseDto login(LoginRequestDto request);
}
