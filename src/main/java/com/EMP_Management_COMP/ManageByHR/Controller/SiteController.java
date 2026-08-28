package com.EMP_Management_COMP.ManageByHR.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EMP_Management_COMP.ManageByHR.Entity.Site;
import com.EMP_Management_COMP.ManageByHR.Service.SiteService;

@RestController
@RequestMapping("/api/customers/{customerId}/sites")
public class SiteController {

    @Autowired
    private SiteService siteService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_SITE')")
    public ResponseEntity<Site> create(@PathVariable Long customerId, @RequestBody Site site) {
        return ResponseEntity.ok(siteService.createSite(customerId, site));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_SITE')")
    public ResponseEntity<List<Site>> getAll(@PathVariable Long customerId) {
        return ResponseEntity.ok(siteService.getSitesByCustomer(customerId));
    }

    @GetMapping("/{siteId}")
    @PreAuthorize("hasAnyAuthority('VIEW_SITE')")
    public ResponseEntity<Site> getOne(@PathVariable Long customerId,
                                        @PathVariable Long siteId) {
        return ResponseEntity.ok(siteService.getSite(siteId));
    }

    @PutMapping("/{siteId}")
    @PreAuthorize("hasAnyAuthority('UPDATE_SITE')")
    public ResponseEntity<Site> update(@PathVariable Long customerId,
                                        @PathVariable Long siteId,
                                        @RequestBody Site site) {
        return ResponseEntity.ok(siteService.updateSite(siteId, site));
    }

    @DeleteMapping("/{siteId}")
    @PreAuthorize("hasAnyAuthority('DELETE_SITE')")
    public ResponseEntity<String> delete(@PathVariable Long customerId,
                                          @PathVariable Long siteId) {
        siteService.deleteSite(siteId);
        return ResponseEntity.ok("Site deleted");
    }
}
