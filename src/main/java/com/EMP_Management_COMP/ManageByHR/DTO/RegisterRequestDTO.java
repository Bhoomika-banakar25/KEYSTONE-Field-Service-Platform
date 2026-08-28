package com.EMP_Management_COMP.ManageByHR.DTO;

import com.EMP_Management_COMP.ManageByHR.ENUM.Role;

public class RegisterRequestDTO {

    public String userName;
    public String userEmail;
    public String phone;
    public String password;
    public Role role;

    public RegisterRequestDTO() {}

    public RegisterRequestDTO(String userName, String userEmail, String phone, String password, Role role) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.phone = phone;
        this.password = password;
        this.role = role;
    }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
