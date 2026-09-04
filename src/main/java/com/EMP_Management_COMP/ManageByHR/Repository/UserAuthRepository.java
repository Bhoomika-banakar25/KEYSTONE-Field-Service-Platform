package com.EMP_Management_COMP.ManageByHR.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {

    Optional<UserAuth> findByUserEmail(String userEmail);

    Optional<UserAuth> findByResetToken(String resetToken);

    java.util.List<UserAuth> findByRole(com.EMP_Management_COMP.ManageByHR.ENUM.Role role);

}