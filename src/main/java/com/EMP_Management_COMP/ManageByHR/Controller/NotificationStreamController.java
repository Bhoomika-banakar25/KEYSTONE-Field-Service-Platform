package com.EMP_Management_COMP.ManageByHR.Controller;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Security.JWTUtil;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationStreamController {

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private JWTUtil jwtUtil;

    // Store emitters for each user
    private static final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * Subscribe to real-time notifications via Server-Sent Events (SSE)
     * Note: EventSource doesn't support Authorization headers, so token is passed as query parameter
     */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @CrossOrigin(origins = "*")
    public SseEmitter subscribe(
            @RequestParam(required = false) String token,
            Authentication auth) throws IOException {
        try {
            // Try to get user from either JWT token query param or Spring Authentication
            UserAuth user = null;
            
            // First try query parameter token (for EventSource which can't send headers)
            if (token != null && !token.isEmpty()) {
                if (jwtUtil.validateToken(token)) {
                    String email = jwtUtil.getUserEmail(token);
                    user = userAuthRepo.findByUserEmail(email).orElse(null);
                    System.out.println("✅ SSE auth via query token for user: " + email);
                } else {
                    System.out.println("❌ Invalid token in query parameter");
                }
            }
            
            // Fall back to Spring Security Authentication (for Postman/curl testing)
            if (user == null && auth != null) {
                String email = auth.getName();
                user = userAuthRepo.findByUserEmail(email).orElse(null);
                System.out.println("✅ SSE auth via Spring Security for user: " + email);
            }
            
            if (user == null) {
                SseEmitter errorEmitter = new SseEmitter();
                errorEmitter.completeWithError(new RuntimeException("Not authenticated"));
                return errorEmitter;
            }

            SseEmitter emitter = new SseEmitter(600000L); // 10 minute timeout
            String userId = "user_" + user.getId();
            emitters.put(userId, emitter);

            emitter.onCompletion(() -> {
                System.out.println("SSE completed for user: " + userId);
                emitters.remove(userId);
            });
            
            emitter.onTimeout(() -> {
                System.out.println("SSE timeout for user: " + userId);
                emitters.remove(userId);
            });
            
            emitter.onError((throwable) -> {
                System.out.println("SSE error for user: " + userId + " - " + throwable.getMessage());
                emitters.remove(userId);
            });

            // Send initial connection message
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(System.currentTimeMillis()))
                        .name("connect")
                        .data(Map.of("message", "Connected to notifications"))
                        .comment("Connection established")
                        .build());
                
                System.out.println("✅ SSE connection established for user: " + user.getUserEmail());
            } catch (IOException e) {
                System.out.println("❌ Error sending initial SSE message: " + e.getMessage());
                emitters.remove(userId);
                throw e;
            }

            return emitter;
        } catch (Exception e) {
            System.out.println("❌ SSE subscribe error: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("SSE connection failed: " + e.getMessage(), e);
        }
    }

    /**
     * Send notification to specific user
     */
    public static void sendNotificationToUser(Long userId, Map<String, Object> notificationData) {
        String key = "user_" + userId;
        SseEmitter emitter = emitters.get(key);
        
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(System.currentTimeMillis()))
                        .name("notification")
                        .data(notificationData)
                        .build());
                
                System.out.println("✅ Notification sent to user: " + userId);
            } catch (IOException e) {
                System.out.println("❌ Error sending notification to user " + userId + ": " + e.getMessage());
                emitters.remove(key);
            }
        } else {
            System.out.println("⚠️  No SSE emitter found for user: " + userId + ". User not connected.");
        }
    }

    /**
     * Send notification to multiple users
     */
    public static void sendNotificationToUsers(java.util.List<UserAuth> users, Map<String, Object> notificationData) {
        for (UserAuth user : users) {
            sendNotificationToUser(user.getId(), notificationData);
        }
    }
}
