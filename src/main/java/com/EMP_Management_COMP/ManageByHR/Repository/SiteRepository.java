package com.EMP_Management_COMP.ManageByHR.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.EMP_Management_COMP.ManageByHR.Entity.Site;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByCustomerId(Long customerId);
    boolean existsByNameAndCustomerId(String name, Long customerId);
}
