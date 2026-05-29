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
                    score += 30;
                    break;
                case WEIGHT_LOSS:
                case CARDIO_STAMINA:
                    score += 25;
                    break;
                case GENERAL_FITNESS:
                case FLEXIBILITY_YOGA:
                    score += 18;
                    break;
                case REHABILITATION:
                    score += 12;
                    break;
                default:
                    score += 10;
            }
        }

        if (lead.getSource() != null) {
            switch (lead.getSource()) {
                case REFERRAL:   score += 18; break;
                case WALK_IN:    score += 16; break;
                case GOOGLE:     score += 14; break;
                case INSTAGRAM:  score += 12; break;
                case FACEBOOK:   score += 10; break;
                case JUSTDIAL:   score += 8; break;
                default:         score += 6;
            }
        }

        if (lead.getPreferredPlan() != null && !lead.getPreferredPlan().isBlank()) {
            String plan = lead.getPreferredPlan().toLowerCase();
            if (plan.contains("annual") || plan.contains("premium") || plan.contains("personal") || plan.contains("pro")) {
                score += 25;
            } else if (plan.contains("quarterly")) {
                score += 18;
            } else if (plan.contains("standard") || plan.contains("basic") || plan.contains("monthly")) {
                score += 12;
            } else {
                score += 10;
            }
        } else {
            score += 8;
        }

        if (lead.isTrialInterested()) {
            score += 22;
        }

        score = Math.min(100, score);
        lead.setScoreValue(score);
    }
}
