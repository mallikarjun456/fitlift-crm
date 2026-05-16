package com.fitlift.controller;

import com.fitlift.dto.LeadDTO;
import com.fitlift.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    // POST /api/leads — create + auto-score
    @PostMapping
    public ResponseEntity<LeadDTO.Response> create(@Valid @RequestBody LeadDTO.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(req));
    }

    // GET /api/leads?status=NEW&scoreLabel=HOT
    @GetMapping
    public ResponseEntity<List<LeadDTO.Response>> getAll(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String scoreLabel
    ) {
        return ResponseEntity.ok(leadService.getAll(status, scoreLabel));
    }

    // GET /api/leads/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LeadDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.getById(id));
    }

    // PUT /api/leads/{id} — full update
    @PutMapping("/{id}")
    public ResponseEntity<LeadDTO.Response> update(
        @PathVariable Long id,
        @Valid @RequestBody LeadDTO.UpdateRequest req
    ) {
        return ResponseEntity.ok(leadService.updateLead(id, req));
    }

    // PATCH /api/leads/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<LeadDTO.Response> updateStatus(
        @PathVariable Long id,
        @RequestBody LeadDTO.UpdateStatusRequest req
    ) {
        return ResponseEntity.ok(leadService.updateStatus(id, req));
    }

    // POST /api/leads/{id}/wa-sent — mark WhatsApp as sent, auto-move to CONTACTED
    @PostMapping("/{id}/wa-sent")
    public ResponseEntity<LeadDTO.Response> markWaSent(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.markWaSent(id));
    }

    // DELETE /api/leads/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leadService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/leads/stats
    @GetMapping("/stats")
    public ResponseEntity<LeadDTO.DashStats> stats() {
        return ResponseEntity.ok(leadService.getStats());
    }

    // ── Error handlers ───────────────────────────────────────────────────────
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(java.util.stream.Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleJsonError(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid data format: " + ex.getMostSpecificCause().getMessage()));
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDatabase(org.springframework.dao.DataAccessException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Database Error: " + ex.getMostSpecificCause().getMessage()));
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<Map<String, String>> handleAll(Throwable ex) {
        ex.printStackTrace(); 
        String msg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        if (ex.getCause() != null) msg += " | Cause: " + ex.getCause().getMessage();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "System Error: " + msg));
    }
}
