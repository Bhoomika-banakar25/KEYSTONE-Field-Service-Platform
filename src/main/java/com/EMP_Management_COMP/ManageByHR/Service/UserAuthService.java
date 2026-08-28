package com.EMP_Management_COMP.ManageByHR.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.DTO.AuthResponseDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.ForgotPasswordDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.LoginRequestDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.RegisterRequestDTO;
import com.EMP_Management_COMP.ManageByHR.DTO.ResetPasswordDTO;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Security.EmailService;
import com.EMP_Management_COMP.ManageByHR.Security.JWTUtil;
import com.EMP_Management_COMP.ManageByHR.Security.TokenKillingService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserAuthService {

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenKillingService tokenKill;

    public AuthResponseDTO register(RegisterRequestDTO register) {

        Optional<UserAuth> existingUser = userAuthRepo.findByUserEmail(register.userEmail);

        if (existingUser.isPresent()) {
            throw new RuntimeException("User already exists");
        }

        UserAuth user = new UserAuth();
        user.setUserName(register.userName);
        user.setUserEmail(register.userEmail);
        user.setPassword(passwordEncoder.encode(register.password));
        user.setPhone(register.phone);
        user.setRole(register.role);

        userAuthRepo.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthResponseDTO(token, "Registration Successful");
    }

    public String login(LoginRequestDTO login) {

        UserAuth user = userAuthRepo.findByUserEmail(login.userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(login.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(user);
    }

    public void forgotPassword(ForgotPasswordDTO forgotPassword) {

        UserAuth user = userAuthRepo.findByUserEmail(forgotPassword.userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setTokenExpireTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000));

        userAuthRepo.save(user);

        emailService.sendResetPasswordMail(forgotPassword.userEmail, token);
    }

    public void resetPassword(ResetPasswordDTO resetPassword) {

        UserAuth user = userAuthRepo.findByResetToken(resetPassword.token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getTokenExpireTime().before(new Date())) {
            throw new RuntimeException("Reset link has expired");
        }

        user.setPassword(passwordEncoder.encode(resetPassword.newPassword));
        user.setResetToken(null);
        user.setTokenExpireTime(null);

        userAuthRepo.save(user);
    }

    public String logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(header);

        if (token != null) {
            tokenKill.blockTokenProcess(token);
        }

        return "Logged out successfully";
    }
}
