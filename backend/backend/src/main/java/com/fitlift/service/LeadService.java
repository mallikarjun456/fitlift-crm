package com.fitlift.service;

import com.fitlift.dto.LeadDTO;
import com.fitlift.model.Lead;
import com.fitlift.repository.LeadRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeadService {

    private final LeadRepository     repo;
    private final LeadScoringService scorer;

    public LeadService(LeadRepository repo, LeadScoringService scorer) {
        this.repo   = repo;
        this.scorer = scorer;
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    public LeadDTO.Response createLead(LeadDTO.CreateRequest req) {
        if (repo.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("A lead with this phone number already exists.");
        }

        Lead lead = new Lead();
        lead.setName(req.getName());
        lead.setPhone(req.getPhone());
        lead.setEmail(req.getEmail());
        lead.setFitnessGoal(parseFitnessGoal(req.getFitnessGoal()));
        lead.setPreferredPlan(req.getPreferredPlan() != null && !req.getPreferredPlan().isBlank() 
            ? req.getPreferredPlan() : "Standard");
        lead.setSource(parseSource(req.getSource()));
        lead.setStatus(parseStatus(req.getStatus()));
        lead.setNotes(req.getNotes());
        lead.setTrialInterested(req.isTrialInterested());
        lead.setTrialDate(req.getTrialDate());

        scorer.score(lead);
        Lead saved = repo.save(lead);
        repo.flush(); // Force DB constraints check now
        return toResponse(saved);
    }

    // ── Fetch all (sorted by score desc) ──────────────────────────────────────
    public List<LeadDTO.Response> getAll(String status, String scoreLabel) {
        List<Lead> leads;

        if (status != null && !status.isBlank()) {
            try {
                Lead.LeadStatus s = Lead.LeadStatus.valueOf(status.toUpperCase().trim());
                leads = repo.findByStatusOrderByScoreValueDesc(s);
            } catch (Exception e) {
                leads = repo.findAllByOrderByScoreValueDesc();
            }
        } else if (scoreLabel != null && !scoreLabel.isBlank()) {
            String label = scoreLabel.toUpperCase().trim();
            leads = repo.findAllByOrderByScoreValueDesc().stream()
                .filter(l -> matchesScoreLabel(l.getScoreValue(), label))
                .collect(Collectors.toList());
        } else {
            leads = repo.findAllByOrderByScoreValueDesc();
        }

        return leads.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Get by ID ──────────────────────────────────────────────────────────────
    public LeadDTO.Response getById(Long id) {
        return toResponse(findById(id));
    }

    // ── Update status ──────────────────────────────────────────────────────────
    public LeadDTO.Response updateStatus(Long id, LeadDTO.UpdateStatusRequest req) {
        Lead lead = findById(id);
        lead.setStatus(req.getStatus());
        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            String existing = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
            lead.setNotes(existing + req.getNotes());
        }
        return toResponse(repo.saveAndFlush(lead));
    }

    // ── Mark WhatsApp sent ─────────────────────────────────────────────────────
    public LeadDTO.Response markWaSent(Long id) {
        Lead lead = findById(id);
        if (lead.getStatus() == Lead.LeadStatus.NEW) {
            lead.setStatus(Lead.LeadStatus.CONTACTED);
        }
        return toResponse(repo.saveAndFlush(lead));
    }

    // ── Update Full ────────────────────────────────────────────────────────────
    public LeadDTO.Response updateLead(Long id, LeadDTO.UpdateRequest req) {
        Lead lead = findById(id);
        
        if (req.getName() != null) lead.setName(req.getName());
        if (req.getPhone() != null) lead.setPhone(req.getPhone());
        if (req.getEmail() != null) lead.setEmail(req.getEmail());
        if (req.getFitnessGoal() != null) lead.setFitnessGoal(parseFitnessGoal(req.getFitnessGoal()));
        if (req.getPreferredPlan() != null) lead.setPreferredPlan(req.getPreferredPlan());
        if (req.getSource() != null) lead.setSource(parseSource(req.getSource()));
        if (req.getStatus() != null) lead.setStatus(parseStatus(req.getStatus()));
        if (req.getNotes() != null) lead.setNotes(req.getNotes());
        
        lead.setTrialInterested(req.isTrialInterested());
        lead.setTrialDate(req.getTrialDate());

        // Re-score lead after changes
        scorer.score(lead);
        
        return toResponse(repo.saveAndFlush(lead));
    }

    // ── Dashboard stats ────────────────────────────────────────────────────────
    public LeadDTO.DashStats getStats() {
        List<Lead> all = repo.findAll();
        LeadDTO.DashStats s = new LeadDTO.DashStats();

        s.setTotal(all.size());
        s.setNewToday(all.stream()
            .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().toLocalDate().equals(LocalDate.now()))
            .count());
        s.setTrialBooked(all.stream().filter(l -> l.getStatus() == Lead.LeadStatus.TRIAL_BOOKED).count());
        s.setJoined(all.stream().filter(l -> l.getStatus() == Lead.LeadStatus.JOINED).count());
        s.setHot(all.stream().filter(l -> l.getScoreValue() >= 80).count());
        s.setWarm(all.stream().filter(l -> l.getScoreValue() >= 50 && l.getScoreValue() < 80).count());
        s.setCold(all.stream().filter(l -> l.getScoreValue() < 50).count());
        s.setConversionPct(all.isEmpty() ? 0 :
            (int) Math.round((s.getJoined() * 100.0) / all.size()));

        return s;
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Lead not found");
        repo.deleteById(id);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private Lead findById(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Lead not found: " + id));
    }

    private Lead.LeadStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Lead.LeadStatus.NEW;
        }
        try {
            return Lead.LeadStatus.valueOf(status.trim().toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException ex) {
            return Lead.LeadStatus.NEW;
        }
    }

    private Lead.LeadSource parseSource(String source) {
        if (source == null || source.isBlank()) {
            return Lead.LeadSource.INSTAGRAM;
        }
        String normalized = source.trim().toUpperCase()
            .replace("&", "AND")
            .replace("-", "_")
            .replace(" ", "_");

        if ("INSTAGRAM_ADS".equals(normalized)) return Lead.LeadSource.INSTAGRAM;
        if ("FACEBOOK_ADS".equals(normalized)) return Lead.LeadSource.FACEBOOK;
        if ("GOOGLE_ADS".equals(normalized)) return Lead.LeadSource.GOOGLE;
        if ("WALK_IN".equals(normalized) || "WALKIN".equals(normalized)) return Lead.LeadSource.WALK_IN;

        try {
            return Lead.LeadSource.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return Lead.LeadSource.OTHER;
        }
    }

    private Lead.FitnessGoal parseFitnessGoal(String fitnessGoal) {
        if (fitnessGoal == null || fitnessGoal.isBlank()) {
            return Lead.FitnessGoal.GENERAL_FITNESS;   // optional field – safe default
        }

        String normalized = fitnessGoal.trim();
        for (Lead.FitnessGoal goal : Lead.FitnessGoal.values()) {
            if (goal.name().equalsIgnoreCase(normalized.replace(" ", "_")) ||
                goal.getLabel().equalsIgnoreCase(normalized)) {
                return goal;
            }
        }
        return Lead.FitnessGoal.GENERAL_FITNESS;   // unrecognised value – safe default
    }

    private LeadDTO.Response toResponse(Lead lead) {
        return LeadDTO.Response.from(lead);
    }

    private boolean matchesScoreLabel(int score, String scoreLabel) {
        return switch (scoreLabel) {
            case "HOT" -> score >= 80;
            case "WARM" -> score >= 50 && score < 80;
            case "COLD" -> score < 50;
            default -> false;
        };
    }
}
