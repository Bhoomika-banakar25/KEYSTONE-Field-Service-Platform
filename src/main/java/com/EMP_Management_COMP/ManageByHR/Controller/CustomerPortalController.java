package com.EMP_Management_COMP.ManageByHR.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.Priority;
import com.EMP_Management_COMP.ManageByHR.Entity.Customer;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Repository.CustomerRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
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

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<List<WorkOrder>> getMyOrders(Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email)
                .orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(workOrderService.getWorkOrdersByCustomer(customer.getId()));
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

        WorkOrder wo = workOrderService.createWorkOrder(
                customer.getId(), siteId, title, desc, priority, email);
        return ResponseEntity.status(201).body(wo);
    }

    @GetMapping("/my-sites")
    @PreAuthorize("hasAnyAuthority('VIEW_OWN_REQUEST')")
    public ResponseEntity<?> getMySites(Principal principal) {
        String email = principal.getName();
        Customer customer = customerRepo.findByEmail(email).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(customer);
    }
}
