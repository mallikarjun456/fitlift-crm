package com.fitlift.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_goal", nullable = false)
    private FitnessGoal fitnessGoal = FitnessGoal.GENERAL_FITNESS;

    @Column(name = "preferred_plan", nullable = false, length = 120)
    private String preferredPlan = "Standard";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadSource source = LeadSource.INSTAGRAM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.NEW;

    @Column(name = "score_value", nullable = false)
    private int scoreValue = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "trial_interested", nullable = false)
    private boolean trialInterested = false;

    @Column(name = "trial_date")
    private LocalDateTime trialDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum FitnessGoal {
        WEIGHT_LOSS("Weight Loss"),
        MUSCLE_GAIN("Muscle Gain"),
        GENERAL_FITNESS("General Fitness"),
        BODYBUILDING("Bodybuilding"),
        CARDIO_STAMINA("Cardio & Stamina"),
        FLEXIBILITY_YOGA("Flexibility / Yoga"),
        REHABILITATION("Rehabilitation");

        private final String label;
        FitnessGoal(String label) { this.label = label; }
        public String getLabel()  { return label; }
    }

    public enum LeadSource {
        INSTAGRAM, FACEBOOK, GOOGLE, WALK_IN, REFERRAL, JUSTDIAL, 
        LINKEDIN, TIKTOK, WHATSAPP, WEBSITE, OTHER
    }

    public enum LeadStatus {
        NEW,
        CONTACTED,
        TRIAL_BOOKED,
        FOLLOW_UP,
        JOINED,
        NOT_INTERESTED
    }

    public Long getId()                         { return id; }
    public String getName()                     { return name; }
    public void setName(String name)            { this.name = name; }
    public String getPhone()                    { return phone; }
    public void setPhone(String phone)          { this.phone = phone; }
    public String getEmail()                    { return email; }
    public void setEmail(String email)          { this.email = email; }
    public FitnessGoal getFitnessGoal()         { return fitnessGoal; }
    public void setFitnessGoal(FitnessGoal v)   { this.fitnessGoal = v; }
    public String getPreferredPlan()            { return preferredPlan; }
    public void setPreferredPlan(String preferredPlan) { this.preferredPlan = preferredPlan; }
    public LeadSource getSource()               { return source; }
    public void setSource(LeadSource source)    { this.source = source; }
    public LeadStatus getStatus()               { return status; }
    public void setStatus(LeadStatus status)    { this.status = status; }
    public int getScoreValue()                  { return scoreValue; }
    public void setScoreValue(int v)            { this.scoreValue = v; }
    public String getNotes()                    { return notes; }
    public void setNotes(String notes)          { this.notes = notes; }
    public boolean isTrialInterested()          { return trialInterested; }
    public void setTrialInterested(boolean v)   { this.trialInterested = v; }
    public LocalDateTime getTrialDate()         { return trialDate; }
    public void setTrialDate(LocalDateTime v)   { this.trialDate = v; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
}
