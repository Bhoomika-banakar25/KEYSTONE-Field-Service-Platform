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

import com.EMP_Management_COMP.ManageByHR.Entity.Part;
import com.EMP_Management_COMP.ManageByHR.Service.PartService;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    @Autowired
    private PartService partService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADD_PARTS')")
    public ResponseEntity<Part> create(@RequestBody Part part) {
        return ResponseEntity.ok(partService.createPart(part));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_PARTS')")
    public ResponseEntity<List<Part>> getAll() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_PARTS')")
    public ResponseEntity<Part> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPart(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPDATE_PARTS')")
    public ResponseEntity<Part> update(@PathVariable Long id, @RequestBody Part part) {
        return ResponseEntity.ok(partService.updatePart(id, part));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DELETE_PARTS')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.ok("Part deleted");
    }
}
