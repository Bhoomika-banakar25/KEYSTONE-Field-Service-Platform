package com.EMP_Management_COMP.ManageByHR.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.Entity.Customer;
import com.EMP_Management_COMP.ManageByHR.Entity.Site;
import com.EMP_Management_COMP.ManageByHR.Repository.CustomerRepository;
import com.EMP_Management_COMP.ManageByHR.Repository.SiteRepository;

@Service
public class SiteService {

    @Autowired
    private SiteRepository siteRepo;

    @Autowired
    private CustomerRepository customerRepo;

    public Site createSite(Long customerId, Site site) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        site.setCustomer(customer);
        site.setActive(true);
        site.setCreatedAt(LocalDateTime.now());
        return siteRepo.save(site);
    }

    public List<Site> getSitesByCustomer(Long customerId) {
        customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return siteRepo.findByCustomerId(customerId);
    }

    public Site getSite(Long id) {
        return siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));
    }

    public Site updateSite(Long id, Site updated) {
        Site existing = siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setContactPhone(updated.getContactPhone());
        existing.setActive(updated.isActive());
        return siteRepo.save(existing);
    }

    public void deleteSite(Long id) {
        Site site = siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));
        siteRepo.delete(site);
    }
}
