package com.EMP_Management_COMP.ManageByHR.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.EMP_Management_COMP.ManageByHR.Entity.Notification;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(UserAuth user);
    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(UserAuth user);
    
    long countByUserAndIsReadFalse(UserAuth user);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.workOrder.id = :workOrderId ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndWorkOrderId(@Param("user") UserAuth user, @Param("workOrderId") Long workOrderId);
}
