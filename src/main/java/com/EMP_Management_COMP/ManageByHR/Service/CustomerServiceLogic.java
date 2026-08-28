package com.EMP_Management_COMP.ManageByHR.Service;

import java.util.List;

import  com.EMP_Management_COMP.ManageByHR.Entity.Customer;

public interface CustomerServiceLogic {

    Customer createCustomer(Customer customer);

    Customer updateCustomer(Long id, Customer customer);

    Customer getCustomer(Long id);

    List<Customer> getAllCustomer();

    void deleteCustomer(Long id);
}