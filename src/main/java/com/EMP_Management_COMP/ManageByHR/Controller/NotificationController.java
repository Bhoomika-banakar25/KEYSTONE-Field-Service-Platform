package com.EMP_Management_COMP.ManageByHR.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.DTO.NotificationDTO;
import com.EMP_Management_COMP.ManageByHR.Entity.Notification;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserAuthRepository userAuthRepo;

    /**
     * Get all unread notifications for current user
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication auth) {
        try {
            String email = auth.getName();
            UserAuth user = userAuthRepo.findByUserEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<Notification> notifications = notificationService.getUnreadNotifications(user);
            List<NotificationDTO> dtos = notifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            long unreadCount = notificationService.getUnreadCount(user);

            return ResponseEntity.ok(Map.of(
                "notifications", dtos,
                "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all notifications for current user
     */
    @GetMapping
    public ResponseEntity<?> getAllNotifications(Authentication auth) {
        try {
            String email = auth.getName();
            UserAuth user = userAuthRepo.findByUserEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<Notification> notifications = notificationService.getAllNotifications(user);
            List<NotificationDTO> dtos = notifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            long unreadCount = notificationService.getUnreadCount(user);

            return ResponseEntity.ok(Map.of(
                "notifications", dtos,
                "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        try {
            Notification notif = notificationService.markAsRead(id);
            if (notif == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
            }
            NotificationDTO dto = new NotificationDTO(notif);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        try {
            String email = auth.getName();
            UserAuth user = userAuthRepo.findByUserEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            notificationService.markAllAsRead(user);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unread notification count for current user
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        try {
            String email = auth.getName();
            UserAuth user = userAuthRepo.findByUserEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            long count = notificationService.getUnreadCount(user);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get paginated notifications with read status
     */
    @GetMapping("/paginated")
    public ResponseEntity<?> getPaginatedNotifications(
            Authentication auth,
            org.springframework.data.domain.Pageable pageable) {
        try {
            String email = auth.getName();
            UserAuth user = userAuthRepo.findByUserEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            List<Notification> allNotifications = notificationService.getAllNotifications(user);
            List<NotificationDTO> dtos = allNotifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            long unreadCount = notificationService.getUnreadCount(user);

            return ResponseEntity.ok(Map.of(
                "notifications", dtos,
                "unreadCount", unreadCount,
                "total", dtos.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
