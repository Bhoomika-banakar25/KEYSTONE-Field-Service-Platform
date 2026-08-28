package com.EMP_Management_COMP.ManageByHR.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.WorkOrderStatus;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderRepository;

@RestController
@RequestMapping("/api/reports")
public class DashboardController {

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD')")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, Object> data = new HashMap<>();
        data.put("total",       workOrderRepo.count());
        data.put("new",         workOrderRepo.countByStatus(WorkOrderStatus.NEW));
        data.put("assigned",    workOrderRepo.countByStatus(WorkOrderStatus.ASSIGNED));
        data.put("inProgress",  workOrderRepo.countByStatus(WorkOrderStatus.IN_PROGRESS));
        data.put("onHold",      workOrderRepo.countByStatus(WorkOrderStatus.ON_HOLD));
        data.put("completed",   workOrderRepo.countByStatus(WorkOrderStatus.COMPLETED));
        data.put("closed",      workOrderRepo.countByStatus(WorkOrderStatus.CLOSED));
        data.put("cancelled",   workOrderRepo.countByStatus(WorkOrderStatus.CANCELLED));
        data.put("slaBreached", workOrderRepo.countBySlaBreachedTrue());
        return ResponseEntity.ok(data);
    }
}
