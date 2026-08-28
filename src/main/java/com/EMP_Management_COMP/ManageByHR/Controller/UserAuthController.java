package com.EMP_Management_COMP.ManageByHR.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.DTO.AuthResponseDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.ForgotPasswordDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.LoginRequestDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.RegisterRequestDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.ResetPasswordDTO;
import com.EMP_Management_COMP.ManageByHR.Service.UserAuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user_auth")
public class UserAuthController {

    @Autowired
    private UserAuthService userAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO register) {
        return ResponseEntity.ok(userAuthService.register(register));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO login) {
        String token = userAuthService.login(login);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDTO forgotPassword) {
        userAuthService.forgotPassword(forgotPassword);
        return ResponseEntity.ok("Reset password link sent to your email");
    }

    @PostMapping("/reset_password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetPassword) {
        userAuthService.resetPassword(resetPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        return ResponseEntity.ok(userAuthService.logout(request));
    }
}
