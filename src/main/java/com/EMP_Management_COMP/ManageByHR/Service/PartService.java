package com.EMP_Management_COMP.ManageByHR.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.Entity.Part;
import com.EMP_Management_COMP.ManageByHR.Repository.PartRepository;

@Service
public class PartService {

    @Autowired
    private PartRepository partRepo;

    public Part createPart(Part part) {
        if (partRepo.existsBySku(part.getSku())) {
            throw new RuntimeException("Part with SKU already exists: " + part.getSku());
        }
        return partRepo.save(part);
    }

    public List<Part> getAllParts() {
        return partRepo.findAll();
    }

    public Part getPart(Long id) {
        return partRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found"));
    }

    public Part updatePart(Long id, Part updated) {
        Part existing = partRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found"));
        existing.setName(updated.getName());
        existing.setUnitCost(updated.getUnitCost());
        existing.setStockQty(updated.getStockQty());
        return partRepo.save(existing);
    }

    public void deletePart(Long id) {
        partRepo.findById(id).orElseThrow(() -> new RuntimeException("Part not found"));
        partRepo.deleteById(id);
    }
}
