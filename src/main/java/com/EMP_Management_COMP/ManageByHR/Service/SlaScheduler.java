package com.EMP_Management_COMP.ManageByHR.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;
import com.EMP_Management_COMP.ManageByHR.Repository.WorkOrderRepository;

@Component
public class SlaScheduler {

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @Scheduled(fixedRate = 15 * 60 * 1000)
    @Transactional
    public void checkSlaBreaches() {
        List<WorkOrder> overdue = workOrderRepo.findOverdueWorkOrders(LocalDateTime.now());
        for (WorkOrder wo : overdue) {
            wo.setSlaBreached(true);
            workOrderRepo.save(wo);
        }
    }
}
