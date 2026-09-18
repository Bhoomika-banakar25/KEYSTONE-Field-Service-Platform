package com.EMP_Management_COMP.ManageByHR.DTO;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.EMP_Management_COMP.ManageByHR.Entity.Notification;

public class NotificationDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long workOrderId;
    private String workOrderCode;
    private String title;
    private String message;
    private String type;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Notification notif) {
        this.id = notif.getId();
        this.userId = notif.getUser() != null ? notif.getUser().getId() : null;
        this.userName = notif.getUser() != null ? notif.getUser().getUserName() : null;
        this.workOrderId = notif.getWorkOrder() != null ? notif.getWorkOrder().getId() : null;
        this.workOrderCode = notif.getWorkOrder() != null ? notif.getWorkOrder().getCode() : null;
        this.title = notif.getTitle();
        this.message = notif.getMessage();
        this.type = notif.getType();
        this.isRead = notif.isRead();
        this.createdAt = notif.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }

    public String getWorkOrderCode() { return workOrderCode; }
    public void setWorkOrderCode(String workOrderCode) { this.workOrderCode = workOrderCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
