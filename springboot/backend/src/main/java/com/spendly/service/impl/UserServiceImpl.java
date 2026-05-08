package com.spendly.service.impl;

import com.spendly.dto.ChangePasswordRequestDto;
import com.spendly.dto.LoginRequestDto;
import com.spendly.dto.LoginResponseDto;
import com.spendly.dto.RegisterRequestDto;
import com.spendly.dto.UpdateProfileRequestDto;
import com.spendly.dto.UserResponseDto;
import com.spendly.exception.EmailAlreadyInUseException;
import com.spendly.exception.IncorrectPasswordException;
import com.spendly.exception.InvalidCredentialsException;
import com.spendly.exception.UserNotFoundException;
import com.spendly.model.User;
import com.spendly.repository.UserRepository;
import com.spendly.service.UserService;
import com.spendly.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyInUseException();
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user);
        return new LoginResponseDto(token, user.getId(), user.getName(), user.getEmail());
    }

    @Override
    public UserResponseDto getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        return toDto(user);
    }

    @Override
    public UserResponseDto updateName(String userId, UpdateProfileRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        user.setName(request.getName());
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Override
    public void changePassword(String userId, ChangePasswordRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IncorrectPasswordException();
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
