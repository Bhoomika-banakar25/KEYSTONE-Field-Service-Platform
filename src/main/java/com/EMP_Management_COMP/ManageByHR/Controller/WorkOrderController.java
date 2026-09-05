package com.EMP_Management_COMP.ManageByHR.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.ENUM.Priority;
import com.EMP_Management_COMP.ManageByHR.ENUM.WorkOrderStatus;
import com.EMP_Management_COMP.ManageByHR.Entity.Feedback;
import com.EMP_Management_COMP.ManageByHR.Entity.PartUsage;
import com.EMP_Management_COMP.ManageByHR.Entity.TimeLog;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrderStatusHistory;
import com.EMP_Management_COMP.ManageByHR.Repository.FeedbackRepository;
import com.EMP_Management_COMP.ManageByHR.Service.WorkOrderService;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private FeedbackRepository feedbackRepo;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_WORK_ORDER')")
    public ResponseEntity<WorkOrder> create(@RequestBody Map<String, Object> body, Principal principal) {
        Long customerId = Long.parseLong(body.get("customerId").toString());
        Long siteId = Long.parseLong(body.get("siteId").toString());
        String title = body.get("title").toString();
        String desc = body.getOrDefault("description", "").toString();
        Priority priority = Priority.valueOf(body.get("priority").toString());
        return ResponseEntity.status(201)
                .body(workOrderService.createWorkOrder(customerId, siteId, title, desc, priority, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<List<WorkOrder>> getAll() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<WorkOrder> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrder(id));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<List<WorkOrderStatusHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getHistory(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPDATE_WORK_ORDER')")
    public ResponseEntity<WorkOrder> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String title = body.get("title").toString();
        String desc = body.getOrDefault("description", "").toString();
        Priority priority = Priority.valueOf(body.get("priority").toString());
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, title, desc, priority));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<WorkOrder> assign(@PathVariable Long id,
            @RequestBody Map<String, Object> body, Principal principal) {
        Long technicianId = Long.parseLong(body.get("technicianId").toString());
        return ResponseEntity.ok(workOrderService.assign(id, technicianId, principal.getName()));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<WorkOrder> transition(@PathVariable Long id,
            @RequestBody Map<String, Object> body, Principal principal) {
        WorkOrderStatus toStatus = WorkOrderStatus.valueOf(body.get("status").toString());
        String note = body.getOrDefault("note", "").toString();
        return ResponseEntity.ok(workOrderService.transition(id, toStatus, principal.getName(), note));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyAuthority('USE_PARTS')")
    public ResponseEntity<PartUsage> logParts(@PathVariable Long id,
            @RequestBody Map<String, Object> body, Principal principal) {
        Long partId = Long.parseLong(body.get("partId").toString());
        int qty = Integer.parseInt(body.get("qty").toString());
        return ResponseEntity.ok(workOrderService.logParts(id, partId, qty, principal.getName()));
    }

    @PostMapping("/{id}/time")
    @PreAuthorize("hasAnyAuthority('ADD_TIME_LOGS')")
    public ResponseEntity<TimeLog> logTime(@PathVariable Long id,
            @RequestBody Map<String, Object> body, Principal principal) {
        int minutes = Integer.parseInt(body.get("minutes").toString());
        String note = body.getOrDefault("note", "").toString();
        return ResponseEntity.ok(workOrderService.logTime(id, minutes, note, principal.getName()));
    }

    @GetMapping("/{id}/feedback")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<Feedback> getFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackRepo.findByWorkOrderId(id).orElse(null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<List<WorkOrder>> getMyWorkOrders(Principal principal) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByTechnicianEmail(principal.getName()));
    }
}
