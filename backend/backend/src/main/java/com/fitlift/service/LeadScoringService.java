package com.fitlift.service;

import com.fitlift.model.Lead;
import org.springframework.stereotype.Service;

@Service
public class LeadScoringService {

    public void score(Lead lead) {
        int score = 0;

        if (lead.getFitnessGoal() != null) {
            switch (lead.getFitnessGoal()) {
                case BODYBUILDING:
                case MUSCLE_GAIN:
                    score += 20;
                    break;
                case WEIGHT_LOSS:
                case CARDIO_STAMINA:
                    score += 15;
                    break;
                case GENERAL_FITNESS:
                case FLEXIBILITY_YOGA:
                    score += 10;
                    break;
                case REHABILITATION:
                    score += 8;
                    break;
                default:
                    score += 5;
            }
        }

        if (lead.getSource() != null) {
            switch (lead.getSource()) {
                case REFERRAL:   score += 10; break;
                case WALK_IN:    score += 8; break;
                case GOOGLE:     score += 6; break;
                case INSTAGRAM:  score += 5; break;
                case FACEBOOK:   score += 4; break;
                case JUSTDIAL:   score += 3; break;
                default:         score += 2;
            }
        }

        if (lead.getPreferredPlan() != null && !lead.getPreferredPlan().isBlank()) {
            String plan = lead.getPreferredPlan().toLowerCase();
            if (plan.contains("premium") || plan.contains("personal") || plan.contains("pro")) {
                score += 20;
            } else if (plan.contains("standard") || plan.contains("basic")) {
                score += 10;
            } else {
                score += 8;
            }
        } else {
            score += 5;
        }

        if (lead.isTrialInterested()) {
            score += 15;
        }

        score = Math.min(100, score);
        lead.setScoreValue(score);
    }
}
