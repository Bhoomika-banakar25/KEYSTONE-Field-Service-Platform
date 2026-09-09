package com.EMP_Management_COMP.ManageByHR.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.Priority;
import com.EMP_Management_COMP.ManageByHR.Entity.Customer;
import com.EMP_Management_COMP.ManageByHR.Entity.Feedback;
import com.EMP_Management_COMP.ManageByHR.Entity.Site;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Repository.CustomerRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.FeedbackRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.SiteRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderRepository;
import com.EMP_Management_COMP.ManageByHR.Service.WorkOrderService;

@RestController
@RequestMapping("/api/portal")
public class CustomerPortalController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private CustomerRepository customerRepo;

    @Autowired
    private FeedbackRepository feedbackRepo;

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @Autowired
    private SiteRepository siteRepo;

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<List<WorkOrder>> getMyOrders(Principal principal) {
        try {
            String email = principal.getName();
            Customer customer = customerRepo.findByEmail(email).orElse(null);
            if (customer == null) return ResponseEntity.ok(List.of());
            List<WorkOrder> orders = workOrderService.getWorkOrdersByCustomer(customer.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/raise-request")
    @PreAuthorize("hasAnyAuthority('RAISE_REQUEST')")
    public ResponseEntity<WorkOrder> raiseRequest(@RequestBody Map<String, Object> body,
            Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer account not found for: " + email));

        Long siteId = Long.parseLong(body.get("siteId").toString());
        String title = body.get("title").toString();
        String desc = body.getOrDefault("description", "").toString();
        Priority priority = Priority.valueOf(body.getOrDefault("priority", "MEDIUM").toString());
        String problemPhoto = body.getOrDefault("problemPhoto", "").toString();

        WorkOrder wo = workOrderService.createWorkOrder(
                customer.getId(), siteId, title, desc, priority, email);

        if (!problemPhoto.isEmpty()) {
            wo.setProblemPhoto(problemPhoto);
            workOrderRepo.save(wo);
        }

        return ResponseEntity.status(201).body(wo);
    }

    @GetMapping("/my-sites")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<?> getMySites(Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email).orElse(null);
        if (customer == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(customer);
    }

    @PostMapping("/feedback/{workOrderId}")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<Feedback> submitFeedback(@PathVariable Long workOrderId,
            @RequestBody Map<String, Object> body, Principal principal) {
        try {
            WorkOrder wo = workOrderRepo.findById(workOrderId)
                    .orElseThrow(() -> new RuntimeException("Work order not found"));

            Optional<Feedback> existing = feedbackRepo.findByWorkOrderId(workOrderId);
            Feedback feedback = existing.orElse(new Feedback());

            feedback.setWorkOrder(wo);
            feedback.setRating(Integer.parseInt(body.getOrDefault("rating", "5").toString()));
            feedback.setComment(body.getOrDefault("comment", "").toString());
            feedback.setFeedbackPhoto(body.getOrDefault("feedbackPhoto", "").toString());
            feedback.setSubmittedAt(LocalDateTime.now());
            feedback.setSubmittedBy(principal.getName());

            Feedback savedFeedback = feedbackRepo.save(feedback);
            System.out.println("Feedback saved successfully for WO " + workOrderId + " with ID: " + savedFeedback.getId());
            return ResponseEntity.ok(savedFeedback);
        } catch (Exception e) {
            System.err.println("Error saving feedback for WO " + workOrderId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/feedback/{workOrderId}")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST', 'VIEW_WORK_ORDER')")
    public ResponseEntity<?> getFeedback(@PathVariable Long workOrderId) {
        try {
            Optional<Feedback> feedback = feedbackRepo.findByWorkOrderId(workOrderId);
            if (feedback.isPresent()) {
                return ResponseEntity.ok(feedback.get());
            } else {
                return ResponseEntity.ok(null);
            }
        } catch (Exception e) {
            System.err.println("Error fetching feedback for work order " + workOrderId + ": " + e.getMessage());
            return ResponseEntity.ok(null);
        }
    }

    @GetMapping("/order/{workOrderId}")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<WorkOrder> getMyOrder(@PathVariable Long workOrderId, Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email).orElse(null);
        if (customer == null) return ResponseEntity.status(403).build();
        
        WorkOrder wo = workOrderRepo.findById(workOrderId).orElse(null);
        if (wo == null) return ResponseEntity.status(404).build();
        
        // Ensure customer can only see their own work order
        if (!wo.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(wo);
    }

    @PostMapping("/add-site")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<Site> addSite(@RequestBody Map<String, Object> body, Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Site site = new Site();
        site.setName(body.getOrDefault("name", "Main Location").toString());
        site.setAddress(body.get("address").toString());
        site.setContactPhone(customer.getPhone());
        site.setActive(true);
        site.setCreatedAt(LocalDateTime.now());
        site.setCustomer(customer);

        customer.setAddress(body.get("address").toString());
        customerRepo.save(customer);

        return ResponseEntity.status(201).body(siteRepo.save(site));
    }
}
