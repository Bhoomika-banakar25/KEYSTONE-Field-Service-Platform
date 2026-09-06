package com.EMP_Management_COMP.ManageByHR.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<List<UserAuth>> getTechnicians() {
        List<UserAuth> techs = userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN || u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());
        return ResponseEntity.ok(techs);
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyAuthority('VIEW_USER')")
    public ResponseEntity<List<UserAuth>> getStaff() {
        List<UserAuth> staff = userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN
                        || u.getRole() == Role.DISPATCHER
                        || u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/staff")
    @PreAuthorize("hasAnyAuthority('CREATE_USER')")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> body, java.security.Principal principal) {
        String email = body.get("userEmail").toString();
        if (userRepo.findByUserEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists");
        }
        Role roleToCreate = Role.valueOf(body.get("role").toString());

        UserAuth requester = userRepo.findByUserEmail(principal.getName()).orElse(null);
        if (requester != null && requester.getRole() == Role.DISPATCHER) {
            if (roleToCreate != Role.TECHNICIAN) {
                return ResponseEntity.status(403).body("Dispatcher can only create Technician accounts");
            }
        }

        UserAuth user = new UserAuth();
        user.setUserName(body.get("userName").toString());
        user.setUserEmail(email);
        user.setPassword(passwordEncoder.encode(body.get("password").toString()));
        user.setPhone(body.getOrDefault("phone", "").toString());
        user.setRole(roleToCreate);
        userRepo.save(user);
        return ResponseEntity.status(201).body(user);
    }

    @DeleteMapping("/staff/{id}")
    @PreAuthorize("hasAnyAuthority('DELETE_USER')")
    public ResponseEntity<String> deleteStaff(@PathVariable Long id) {
        userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepo.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }
}
