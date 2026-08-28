package com.EMP_Management_COMP.ManageByHR.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.EMP_Management_COMP.ManageByHR.Entity.Part;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findBySku(String sku);
    boolean existsBySku(String sku);
}
