package com.fitlift.dto;

import com.fitlift.model.Lead;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;

public class LeadDTO {

    // ── CREATE REQUEST ────────────────────────────────────────────────────────
    public static class CreateRequest {

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[+]?[0-9]{10,13}$", message = "Invalid phone number")
        private String phone;

        private String email;

        private String fitnessGoal;

        private String preferredPlan;

        private String source;

        private String status;

        private String notes;
        private boolean trialInterested;
        private LocalDateTime trialDate;

        public String getName()                   { return name; }
        public void setName(String v)             { this.name = v; }
        public String getPhone()                  { return phone; }
        public void setPhone(String v)            { this.phone = v; }
        public String getEmail()                  { return email; }
        public void setEmail(String v)            { this.email = v; }
        public String getFitnessGoal()            { return fitnessGoal; }
        public void setFitnessGoal(String v)      { this.fitnessGoal = v; }
        public String getPreferredPlan()          { return preferredPlan; }
        public void setPreferredPlan(String v)    { this.preferredPlan = v; }
        public String getSource()                 { return source; }
        public void setSource(String v)           { this.source = v; }
        public String getStatus()                 { return status; }
        public void setStatus(String v)           { this.status = v; }
        public String getNotes()                  { return notes; }
        public void setNotes(String v)            { this.notes = v; }
        public boolean isTrialInterested()        { return trialInterested; }
        public void setTrialInterested(boolean v) { this.trialInterested = v; }
        public LocalDateTime getTrialDate()       { return trialDate; }
        public void setTrialDate(LocalDateTime v) { this.trialDate = v; }
    }

    // ── UPDATE REQUEST ────────────────────────────────────────────────────────
    public static class UpdateRequest {
        private String name;
        private String phone;
        private String email;
        private String fitnessGoal;
        private String preferredPlan;
        private String source;
        private String status;
        private String notes;
        private boolean trialInterested;
        private LocalDateTime trialDate;

        public String getName()                   { return name; }
        public void setName(String v)             { this.name = v; }
        public String getPhone()                  { return phone; }
        public void setPhone(String v)            { this.phone = v; }
        public String getEmail()                  { return email; }
        public void setEmail(String v)            { this.email = v; }
        public String getFitnessGoal()            { return fitnessGoal; }
        public void setFitnessGoal(String v)      { this.fitnessGoal = v; }
        public String getPreferredPlan()          { return preferredPlan; }
        public void setPreferredPlan(String v)    { this.preferredPlan = v; }
        public String getSource()                 { return source; }
        public void setSource(String v)           { this.source = v; }
        public String getStatus()                 { return status; }
        public void setStatus(String v)           { this.status = v; }
        public String getNotes()                  { return notes; }
        public void setNotes(String v)            { this.notes = v; }
        public boolean isTrialInterested()        { return trialInterested; }
        public void setTrialInterested(boolean v) { this.trialInterested = v; }
        public LocalDateTime getTrialDate()       { return trialDate; }
        public void setTrialDate(LocalDateTime v) { this.trialDate = v; }
    }

    // ── UPDATE STATUS REQUEST ─────────────────────────────────────────────────

    // ── UPDATE STATUS REQUEST ─────────────────────────────────────────────────
    public static class UpdateStatusRequest {
        @NotNull
        private Lead.LeadStatus status;
        private String notes;

        public Lead.LeadStatus getStatus() { return status; }
        public void setStatus(Lead.LeadStatus v) { this.status = v; }
        public String getNotes()            { return notes; }
        public void setNotes(String v)      { this.notes = v; }
    }

    // ── RESPONSE ──────────────────────────────────────────────────────────────
    public static class Response {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private String fitnessGoal;
        private String preferredPlan;
        private String source;
        private String status;
        private int score;
        private String notes;
        private boolean trialInterested;
        private LocalDateTime trialDate;
        private LocalDateTime createdAt;

        public static Response from(Lead l) {
            Response r = new Response();
            r.id             = l.getId();
            r.name           = l.getName();
            r.phone          = l.getPhone();
            r.email          = l.getEmail();
            r.fitnessGoal    = l.getFitnessGoal().getLabel();
            r.preferredPlan  = l.getPreferredPlan();
            r.source         = l.getSource().name();
            r.status         = l.getStatus().name();
            r.score          = l.getScoreValue();
            r.notes          = l.getNotes();
            r.trialInterested = l.isTrialInterested();
            r.trialDate      = l.getTrialDate();
            r.createdAt      = l.getCreatedAt();
            return r;
        }

        public Long getId()                 { return id; }
        public String getName()             { return name; }
        public String getPhone()            { return phone; }
        public String getEmail()            { return email; }
        public String getFitnessGoal()      { return fitnessGoal; }
        public String getPreferredPlan()    { return preferredPlan; }
        public String getSource()           { return source; }
        public String getStatus()           { return status; }
        public int getScore()               { return score; }
        public String getNotes()            { return notes; }
        public boolean isTrialInterested()  { return trialInterested; }
        public LocalDateTime getTrialDate() { return trialDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    // ── DASHBOARD STATS ───────────────────────────────────────────────────────
    public static class DashStats {
        private long total;
        private long newToday;
        private long trialBooked;
        private long joined;
        private long hot;
        private long warm;
        private long cold;
        private int conversionPct;   // joined/total*100

        public long getTotal()              { return total; }
        public void setTotal(long v)        { this.total = v; }
        public long getNewToday()           { return newToday; }
        public void setNewToday(long v)     { this.newToday = v; }
        public long getTrialBooked()        { return trialBooked; }
        public void setTrialBooked(long v)  { this.trialBooked = v; }
        public long getJoined()             { return joined; }
        public void setJoined(long v)       { this.joined = v; }
        public long getHot()                { return hot; }
        public void setHot(long v)          { this.hot = v; }
        public long getWarm()               { return warm; }
        public void setWarm(long v)         { this.warm = v; }
        public long getCold()               { return cold; }
        public void setCold(long v)         { this.cold = v; }
        public int getConversionPct()       { return conversionPct; }
        public void setConversionPct(int v) { this.conversionPct = v; }
    }
}
