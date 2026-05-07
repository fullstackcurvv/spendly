package com.spendly.controller;

import com.spendly.dto.ChangePasswordRequestDto;
import com.spendly.dto.UpdateProfileRequestDto;
import com.spendly.dto.UserResponseDto;
import com.spendly.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private String currentUserId() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getProfile() {
        return ResponseEntity.ok(userService.getProfile(currentUserId()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponseDto> updateName(@Valid @RequestBody UpdateProfileRequestDto request) {
        return ResponseEntity.ok(userService.updateName(currentUserId(), request));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        userService.changePassword(currentUserId(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
