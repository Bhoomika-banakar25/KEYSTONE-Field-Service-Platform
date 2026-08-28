package com.EMP_Management_COMP.ManageByHR;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ManageByHrApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManageByHrApplication.class, args);
	}

}
