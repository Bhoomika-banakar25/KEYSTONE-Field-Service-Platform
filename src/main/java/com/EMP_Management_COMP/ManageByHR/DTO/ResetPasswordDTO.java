package com.EMP_Management_COMP.ManageByHR.DTO;

public class ResetPasswordDTO {

    public String token;
    public String newPassword;

    public ResetPasswordDTO() {}

    public ResetPasswordDTO(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
