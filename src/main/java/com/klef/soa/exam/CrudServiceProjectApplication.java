package com.klef.soa.exam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CrudServiceProjectApplication {
    public static void main(String[] args) {
        SpringApplication.run(CrudServiceProjectApplication.class, args);
        System.out.println("CRUD service project is running...!!!");
        }
}
