package com.EMP_Management_COMP.ManageByHR.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendResetPasswordMail(String to, String token) {

        String resetPasswordLink =
                "http://localhost:9899/api/user_auth/reset_password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset Your Password - ManageByHR");
        message.setText("Click the link below to reset your password:\n\n" + resetPasswordLink
                + "\n\nThis link is valid for 10 minutes.");

        javaMailSender.send(message);
    }
}
