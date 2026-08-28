package com.EMP_Management_COMP.ManageByHR.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.Role;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserAuthRepository userRepo;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<List<UserAuth>> getTechnicians() {
        List<UserAuth> techs = userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN || u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());
        return ResponseEntity.ok(techs);
    }
}
