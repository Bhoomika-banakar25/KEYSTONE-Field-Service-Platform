package com.EMP_Management_COMP.ManageByHR.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.WorkOrderStatus;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Repository.FeedbackRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderRepository;

@RestController
@RequestMapping("/api/reports")
public class DashboardController {

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private FeedbackRepository feedbackRepo;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD')")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, Object> data = new HashMap<>();
        data.put("total",      workOrderRepo.count());
        data.put("new",        workOrderRepo.countByStatus(WorkOrderStatus.NEW));
        data.put("assigned",   workOrderRepo.countByStatus(WorkOrderStatus.ASSIGNED));
        data.put("inProgress", workOrderRepo.countByStatus(WorkOrderStatus.IN_PROGRESS));
        data.put("onHold",     workOrderRepo.countByStatus(WorkOrderStatus.ON_HOLD));
        data.put("completed",  workOrderRepo.countByStatus(WorkOrderStatus.COMPLETED));
        data.put("closed",     workOrderRepo.countByStatus(WorkOrderStatus.CLOSED));
        data.put("cancelled",  workOrderRepo.countByStatus(WorkOrderStatus.CANCELLED));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/my-summary")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<Map<String, Object>> mySummary(Principal principal) {
        String email = principal.getName();
        UserAuth tech = userAuthRepo.findByUserEmail(email).orElse(null);
        if (tech == null) return ResponseEntity.ok(Map.of());

        List<WorkOrder> myJobs = workOrderRepo.findByAssignedToId(tech.getId());

        long totalAssigned  = myJobs.size();
        long inProgress     = myJobs.stream().filter(w -> w.getStatus() == WorkOrderStatus.IN_PROGRESS).count();
        long completed      = myJobs.stream().filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED
                                                       || w.getStatus() == WorkOrderStatus.CLOSED).count();
        long onHold         = myJobs.stream().filter(w -> w.getStatus() == WorkOrderStatus.ON_HOLD).count();
        long feedbackCount  = myJobs.stream()
                .filter(w -> feedbackRepo.findByWorkOrderId(w.getId()).isPresent())
                .count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalAssigned", totalAssigned);
        data.put("inProgress",    inProgress);
        data.put("completed",     completed);
        data.put("onHold",        onHold);
        data.put("feedbackCount", feedbackCount);
        return ResponseEntity.ok(data);
    }
}
