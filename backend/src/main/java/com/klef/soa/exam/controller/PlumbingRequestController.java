package com.klef.soa.exam.controller;

import com.klef.soa.exam.entity.PlumbingRequestEntity;
import com.klef.soa.exam.service.PlumbingRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class PlumbingRequestController {

    @Autowired
    private PlumbingRequestService service;

    @GetMapping("/")
    public String home() {
        return "CRUD Service is running";
    }

    @PostMapping("/Add")
    public ResponseEntity<PlumbingRequestEntity> add(@RequestBody PlumbingRequestEntity request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addRequest(request));
    }

    @GetMapping("/DisplayAll")
    public List<PlumbingRequestEntity> displayAll() {
        return service.displayAll();
    }

    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        if (service.deleteRequest(id)) {
            return ResponseEntity.ok("Plumbing request with ID " + id + " deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Plumbing request with ID " + id + " not found");
    }
}
