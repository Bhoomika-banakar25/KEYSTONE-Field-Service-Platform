package com.EMP_Management_COMP.ManageByHR.DTO;

public class ForgotPasswordDTO {

    public String userEmail;

    public ForgotPasswordDTO() {}

    public ForgotPasswordDTO(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
