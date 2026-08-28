package com.EMP_Management_COMP.ManageByHR.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.EMP_Management_COMP.ManageByHR.Entity.TimeLog;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByWorkOrderId(Long workOrderId);

    @Query("SELECT COALESCE(SUM(t.minutes), 0) FROM TimeLog t WHERE t.workOrder.id = :workOrderId")
    int sumMinutesByWorkOrderId(Long workOrderId);
}
