package com.EMP_Management_COMP.ManageByHR.Security;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.ENUM.Permissions;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserAuthRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {
        return loadUserByUserEmail(userEmail);
    }

    public UserDetails loadUserByUserEmail(String userEmail) {

        UserAuth user = userRepo.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Permissions> perm = RoleBasedPermissions.getRoleBasedPermissions()
                .get(user.getRole());

        List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (perm != null) {
            authorities.addAll(perm.stream()
                    .map(p -> new SimpleGrantedAuthority(p.name()))
                    .collect(Collectors.toList()));
        }

        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new org.springframework.security.core.userdetails.User(
                user.getUserEmail(),
                user.getPassword(),
                authorities);
    }
}
