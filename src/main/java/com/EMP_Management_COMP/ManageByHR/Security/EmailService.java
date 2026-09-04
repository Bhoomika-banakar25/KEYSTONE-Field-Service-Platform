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
        message.setSubject("Reset Your Password - KEYSTONE");
        message.setText("Click the link below to reset your password:\n\n" + resetPasswordLink
                + "\n\nThis link is valid for 10 minutes.");

        javaMailSender.send(message);
    }

    public void sendWorkOrderCompletedNotification(String managerEmail, String workOrderCode,
            String workOrderTitle, String technicianEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(managerEmail);
            message.setSubject("[KEYSTONE] Work Order Completed: " + workOrderCode);
            message.setText("Work order " + workOrderCode + " has been marked as COMPLETED.\n\n"
                    + "Title: " + workOrderTitle + "\n"
                    + "Completed by: " + technicianEmail + "\n\n"
                    + "Please review and close the work order in KEYSTONE.");
            javaMailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email notification failed: " + e.getMessage());
        }
    }
}
