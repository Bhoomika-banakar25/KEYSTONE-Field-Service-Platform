package com.EMP_Management_COMP.ManageByHR.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.EMP_Management_COMP.ManageByHR.Entity.Customer;
import com.EMP_Management_COMP.ManageByHR.Repository.CustomerRepository;

@Service
public class CustomerServiceLogicImpl implements CustomerServiceLogic {

    @Autowired
    private CustomerRepository cusRepo;

    @Override
    public Customer createCustomer(Customer customer) {

        if (cusRepo.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Customer already exists");
        }

        customer.setActive(true);
        customer.setCreatedAt(LocalDateTime.now());

        return cusRepo.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customer) {

        Customer existingCustomer = cusRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        existingCustomer.setCompanyName(customer.getCompanyName());
        existingCustomer.setContactPerson(customer.getContactPerson());
        existingCustomer.setEmail(customer.getEmail());
        existingCustomer.setPhone(customer.getPhone());
        existingCustomer.setAddress(customer.getAddress());
        existingCustomer.setActive(customer.isActive());

        return cusRepo.save(existingCustomer);
    }

    @Override
    public Customer getCustomer(Long id) {

        return cusRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @Override
    public List<Customer> getAllCustomer() {

        return cusRepo.findAll();
    }

    @Override
    public void deleteCustomer(Long id) {

        Customer custom = cusRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        cusRepo.delete(custom);
    }
}
