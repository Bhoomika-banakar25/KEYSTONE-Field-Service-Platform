package com.EMP_Management_COMP.ManageByHR.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.EMP_Management_COMP.ManageByHR.ENUM.WorkOrderStatus;
import com.EMP_Management_COMP.ManageByHR.Entity.WorkOrder;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByCode(String code);

    List<WorkOrder> findByAssignedToId(Long technicianId);

    List<WorkOrder> findByCustomerId(Long customerId);

    List<WorkOrder> findByStatus(WorkOrderStatus status);

    @Query("SELECT w FROM WorkOrder w WHERE w.slaBreached = false " +
           "AND w.status NOT IN ('CLOSED','CANCELLED') " +
           "AND w.slaDueAt < :now")
    List<WorkOrder> findOverdueWorkOrders(LocalDateTime now);

    long countByStatus(WorkOrderStatus status);

    long countBySlaBreachedTrue();
}
