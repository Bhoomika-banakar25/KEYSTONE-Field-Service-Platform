package com.EMP_Management_COMP.ManageByHR.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.EMP_Management_COMP.ManageByHR.ENUM.Priority;
import com.EMP_Management_COMP.ManageByHR.ENUM.Role;
import com.EMP_Management_COMP.ManageByHR.ENUM.WorkOrderStatus;
import com.EMP_Management_COMP.ManageByHR.Entity.Part;
import com.EMP_Management_COMP.ManageByHR.Entity.PartUsage;
import com.EMP_Management_COMP.ManageByHR.Entity.TimeLog;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrderStatusHistory;
import com.EMP_Management_COMP.ManageByHR.Repository.CustomerRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.PartRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.PartUsageRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.SiteRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.TimeLogRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.UserAuthRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderStatusHistoryRepository;
import com.EMP_Management_COMP.ManageByHR.Security.EmailService;

@Service
public class WorkOrderService {

    @Autowired private WorkOrderRepository workOrderRepo;
    @Autowired private UserAuthRepository userAuthRepo;
    @Autowired private CustomerRepository customerRepo;
    @Autowired private SiteRepository siteRepo;
    @Autowired private WorkOrderStatusHistoryRepository historyRepo;
    @Autowired private PartRepository partRepo;
    @Autowired private PartUsageRepository partUsageRepo;
    @Autowired private TimeLogRepository timeLogRepo;
    @Autowired private EmailService emailService;

    @Transactional
    public WorkOrder createWorkOrder(Long customerId, Long siteId, String title,
            String description, Priority priority, String createdBy) {
        WorkOrder wo = new WorkOrder();
        wo.setCustomer(customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found")));
        wo.setSite(siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found")));
        wo.setTitle(title);
        wo.setDescription(description);
        wo.setPriority(priority);
        wo.setStatus(WorkOrderStatus.NEW);
        wo.setCreatedAt(LocalDateTime.now());
        wo.setUpdatedAt(LocalDateTime.now());
        wo.setSlaDueAt(calcSlaDueAt(priority));
        wo.setCode(generateCode());
        WorkOrder saved = workOrderRepo.save(wo);
        historyRepo.save(new WorkOrderStatusHistory(saved, null, WorkOrderStatus.NEW, createdBy, "Work order created"));
        return saved;
    }

    public WorkOrder getWorkOrder(Long id) {
        return workOrderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
    }

    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepo.findAll();
    }

    public List<WorkOrder> getWorkOrdersByTechnician(Long technicianId) {
        return workOrderRepo.findByAssignedToId(technicianId);
    }

    public List<WorkOrder> getWorkOrdersByCustomer(Long customerId) {
        return workOrderRepo.findByCustomerId(customerId);
    }

    public List<WorkOrderStatusHistory> getHistory(Long workOrderId) {
        return historyRepo.findByWorkOrderIdOrderByChangedAtAsc(workOrderId);
    }

    @Transactional
    public WorkOrder updateWorkOrder(Long id, String title, String description, Priority priority) {
        WorkOrder wo = workOrderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        if (wo.getStatus() == WorkOrderStatus.CLOSED || wo.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot edit a closed or cancelled work order");
        }
        wo.setTitle(title);
        wo.setDescription(description);
        wo.setPriority(priority);
        wo.setUpdatedAt(LocalDateTime.now());
        return workOrderRepo.save(wo);
    }

    @Transactional
    public WorkOrder assign(Long workOrderId, Long technicianId, String assignedBy) {
        WorkOrder wo = workOrderRepo.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        if (wo.getStatus() == WorkOrderStatus.CLOSED || wo.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot assign a closed or cancelled work order");
        }
        UserAuth tech = userAuthRepo.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        WorkOrderStatus prev = wo.getStatus();
        wo.setAssignedTo(tech);
        wo.setStatus(WorkOrderStatus.ASSIGNED);
        wo.setUpdatedAt(LocalDateTime.now());
        workOrderRepo.save(wo);
        historyRepo.save(new WorkOrderStatusHistory(wo, prev, WorkOrderStatus.ASSIGNED,
                assignedBy, "Assigned to " + tech.getUserEmail()));
        return wo;
    }

    @Transactional
    public WorkOrder transition(Long workOrderId, WorkOrderStatus toStatus,
            String changedBy, String note) {
        WorkOrder wo = workOrderRepo.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        validateTransition(wo.getStatus(), toStatus);
        WorkOrderStatus prev = wo.getStatus();
        wo.setStatus(toStatus);
        wo.setUpdatedAt(LocalDateTime.now());
        workOrderRepo.save(wo);
        historyRepo.save(new WorkOrderStatusHistory(wo, prev, toStatus, changedBy, note));

        if (toStatus == WorkOrderStatus.COMPLETED) {
            List<UserAuth> managers = userAuthRepo.findByRole(Role.MANAGER);
            for (UserAuth manager : managers) {
                emailService.sendWorkOrderCompletedNotification(
                        manager.getUserEmail(), wo.getCode(), wo.getTitle(), changedBy);
            }
        }

        return wo;
    }

    private void validateTransition(WorkOrderStatus from, WorkOrderStatus to) {
        boolean allowed = switch (from) {
            case NEW         -> to == WorkOrderStatus.ASSIGNED    || to == WorkOrderStatus.CANCELLED;
            case ASSIGNED    -> to == WorkOrderStatus.IN_PROGRESS || to == WorkOrderStatus.CANCELLED;
            case IN_PROGRESS -> to == WorkOrderStatus.ON_HOLD     || to == WorkOrderStatus.COMPLETED;
            case ON_HOLD     -> to == WorkOrderStatus.IN_PROGRESS || to == WorkOrderStatus.CANCELLED;
            case COMPLETED   -> to == WorkOrderStatus.CLOSED      || to == WorkOrderStatus.IN_PROGRESS;
            case CLOSED      -> false;
            case CANCELLED   -> false;
        };
        if (!allowed) {
            throw new RuntimeException("Illegal transition: " + from + " to " + to);
        }
    }

    @Transactional
    public PartUsage logParts(Long workOrderId, Long partId, int qty, String usedBy) {
        WorkOrder wo = workOrderRepo.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        if (wo.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only log parts when work order is IN_PROGRESS");
        }
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));
        if (part.getStockQty() < qty) {
            throw new RuntimeException("Insufficient stock. Available: " + part.getStockQty());
        }
        part.setStockQty(part.getStockQty() - qty);
        partRepo.save(part);
        PartUsage usage = new PartUsage();
        usage.setWorkOrder(wo);
        usage.setPart(part);
        usage.setQtyUsed(qty);
        usage.setUsedBy(usedBy);
        usage.setUsedAt(LocalDateTime.now());
        return partUsageRepo.save(usage);
    }

    @Transactional
    public TimeLog logTime(Long workOrderId, int minutes, String note, String technicianEmail) {
        WorkOrder wo = workOrderRepo.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found"));
        if (wo.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only log time when work order is IN_PROGRESS");
        }
        TimeLog log = new TimeLog();
        log.setWorkOrder(wo);
        log.setMinutes(minutes);
        log.setNote(note);
        log.setTechnicianEmail(technicianEmail);
        log.setLoggedAt(LocalDateTime.now());
        return timeLogRepo.save(log);
    }

    private LocalDateTime calcSlaDueAt(Priority priority) {
        return switch (priority) {
            case CRITICAL -> LocalDateTime.now().plusHours(4);
            case HIGH     -> LocalDateTime.now().plusHours(24);
            case MEDIUM   -> LocalDateTime.now().plusHours(48);
            case LOW      -> LocalDateTime.now().plusHours(72);
        };
    }

    private String generateCode() {
        long count = workOrderRepo.count() + 1;
        return String.format("WO-%04d", count);
    }
}
