package com.example.springboot.controller;

import com.example.springboot.model.Comment;
import com.example.springboot.model.Enquiry;
import com.example.springboot.model.EnquiryStatus;
import com.example.springboot.model.User;
import com.example.springboot.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing enquiries - simplified and functional.
 */
@RestController
@RequestMapping("/enquiries")
@CrossOrigin(origins = "*")
public class EnquiryController {

    @Autowired
    private EnquiryService enquiryService;

    // Basic CRUD
    @PostMapping
    public ResponseEntity<Enquiry> create(@Valid @RequestBody Enquiry enquiry) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enquiryService.create(enquiry));
    }

    @GetMapping
    public ResponseEntity<List<Enquiry>> getAll() {
        return ResponseEntity.ok(enquiryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enquiry> getById(@PathVariable UUID id) {
        return enquiryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/process/{processInstanceId}")
    public ResponseEntity<Enquiry> getByProcessInstanceId(@PathVariable String processInstanceId) {
        return enquiryService.findByProcessInstanceId(processInstanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Enquiry> update(@PathVariable UUID id, @Valid @RequestBody Enquiry enquiry) {
        return enquiryService.update(id, enquiry)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return enquiryService.delete(id) 
                ? ResponseEntity.noContent().build() 
                : ResponseEntity.notFound().build();
    }

    // Functional operations
    @PatchMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateStatus(@PathVariable UUID id, @RequestParam EnquiryStatus status) {
        return enquiryService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Enquiry> assign(@PathVariable UUID id, @RequestBody User assignee) {
        return enquiryService.assign(id, assignee)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Enquiry> resolve(@PathVariable UUID id, @RequestParam String resolutionNotes) {
        return enquiryService.resolve(id, resolutionNotes)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Comment management endpoints
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(enquiryService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable UUID id, @Valid @RequestBody Comment comment) {
        return enquiryService.addComment(id, comment.getComment(), comment.getCommentedBy())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable UUID id, @PathVariable UUID commentId, @Valid @RequestBody Comment comment) {
        return enquiryService.updateComment(id, commentId, comment.getComment())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id, @PathVariable UUID commentId) {
        return enquiryService.deleteComment(id, commentId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

}