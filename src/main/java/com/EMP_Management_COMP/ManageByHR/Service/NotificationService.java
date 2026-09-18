package com.EMP_Management_COMP.ManageByHR.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.Entity.Notification;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Repository.NotificationRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private UserAuthRepository userAuthRepo;

    /**
     * Create notification for a specific user
     */
    public Notification createNotification(UserAuth user, WorkOrder workOrder, String title, String message, String type) {
        if (user == null || workOrder == null) {
            return null;
        }
        Notification notif = new Notification(user, workOrder, title, message, type);
        return notificationRepo.save(notif);
    }

    /**
     * Get all unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(UserAuth user) {
        return notificationRepo.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getAllNotifications(UserAuth user) {
        return notificationRepo.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(UserAuth user) {
        return notificationRepo.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark notification as read
     */
    public Notification markAsRead(Long notificationId) {
        return notificationRepo.findById(notificationId).map(notif -> {
            notif.setRead(true);
            return notificationRepo.save(notif);
        }).orElse(null);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(UserAuth user) {
        List<Notification> unread = notificationRepo.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }

    /**
     * Send notification to request creator (Manager/Dispatcher only)
     * When customer raises a request
     */
    public void notifyRequestCreated(WorkOrder workOrder, UserAuth manager, UserAuth dispatcher) {
        String title = "🔔 New Service Request";
        String message = "Work Order " + workOrder.getCode() + " - " + workOrder.getTitle();
        
        if (manager != null) {
            Notification notif = createNotification(manager, workOrder, title, message, "REQUEST_CREATED");
            // Send real-time notification
            sendRealTimeNotification(manager.getId(), title, message, workOrder.getId(), "REQUEST_CREATED");
        }
        if (dispatcher != null) {
            Notification notif = createNotification(dispatcher, workOrder, title, message, "REQUEST_CREATED");
            // Send real-time notification
            sendRealTimeNotification(dispatcher.getId(), title, message, workOrder.getId(), "REQUEST_CREATED");
        }
    }

    /**
     * Send notification when technician is assigned
     * To: Customer, Technician
     */
    public void notifyTechnicianAssigned(WorkOrder workOrder, UserAuth customer, UserAuth technician) {
        String title = "✅ Technician Assigned";
        String message = workOrder.getCode() + " assigned to " + technician.getUserName();
        
        if (customer != null) {
            createNotification(customer, workOrder, title, message, "ASSIGNED");
            // Send real-time notification
            sendRealTimeNotification(customer.getId(), title, message, workOrder.getId(), "ASSIGNED");
        }
        if (technician != null) {
            createNotification(technician, workOrder, title, 
                "You have been assigned: " + workOrder.getCode() + " - " + workOrder.getTitle(), "ASSIGNED");
            // Send real-time notification
            sendRealTimeNotification(technician.getId(), "📋 New Assignment", 
                "You have been assigned: " + workOrder.getCode(), workOrder.getId(), "ASSIGNED");
        }
    }

    /**
     * Send notification when work is completed
     * To: Customer, Manager, Dispatcher
     */
    public void notifyWorkCompleted(WorkOrder workOrder, UserAuth customer, UserAuth manager, UserAuth dispatcher) {
        String title = "✅ Work Completed";
        String message = workOrder.getCode() + " has been completed successfully";
        
        if (customer != null) {
            createNotification(customer, workOrder, title, message, "COMPLETED");
            sendRealTimeNotification(customer.getId(), title, message, workOrder.getId(), "COMPLETED");
        }
        if (manager != null) {
            createNotification(manager, workOrder, title, message, "COMPLETED");
            sendRealTimeNotification(manager.getId(), title, message, workOrder.getId(), "COMPLETED");
        }
        if (dispatcher != null) {
            createNotification(dispatcher, workOrder, title, message, "COMPLETED");
            sendRealTimeNotification(dispatcher.getId(), title, message, workOrder.getId(), "COMPLETED");
        }
    }

    /**
     * Send real-time notification via SSE
     */
    private void sendRealTimeNotification(Long userId, String title, String message, Long workOrderId, String type) {
        java.util.Map<String, Object> notifData = new java.util.HashMap<>();
        notifData.put("title", title);
        notifData.put("message", message);
        notifData.put("workOrderId", workOrderId);
        notifData.put("type", type);
        notifData.put("timestamp", java.time.LocalDateTime.now());
        
        com.EMP_Management_COMP.ManageByHR.Controller.NotificationStreamController.sendNotificationToUser(userId, notifData);
    }
}
