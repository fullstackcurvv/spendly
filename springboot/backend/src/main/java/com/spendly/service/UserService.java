package com.spendly.service;

import com.spendly.dto.ChangePasswordRequestDto;
import com.spendly.dto.LoginRequestDto;
import com.spendly.dto.LoginResponseDto;
import com.spendly.dto.RegisterRequestDto;
import com.spendly.dto.UpdateProfileRequestDto;
import com.spendly.dto.UserResponseDto;

public interface UserService {

    UserResponseDto register(RegisterRequestDto request);

    LoginResponseDto login(LoginRequestDto request);

    UserResponseDto getProfile(String userId);

    UserResponseDto updateName(String userId, UpdateProfileRequestDto request);

    void changePassword(String userId, ChangePasswordRequestDto request);
}
