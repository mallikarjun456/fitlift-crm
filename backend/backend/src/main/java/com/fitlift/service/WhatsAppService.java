package com.fitlift.service;

import com.fitlift.model.Lead;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class WhatsAppService {

    @Value("${fitlift.gym.name:FitZone Gym}")
    private String gymName;

    @Value("${fitlift.gym.area:Hinjewadi, Pune}")
    private String gymArea;

    public String buildWaLink(Lead lead) {
        String message = buildMessage(lead);
        String cleanPhone = lead.getPhone().replaceAll("[^\\d]", "");
        if (cleanPhone.length() == 10) cleanPhone = "91" + cleanPhone;
        String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8);
        return "https://wa.me/" + cleanPhone + "?text=" + encoded;
    }

    public String buildMessage(Lead lead) {
        String firstName = lead.getName().split(" ")[0];
        String goal      = lead.getFitnessGoal().getLabel();
        String plan      = lead.getPreferredPlan();

        StringBuilder sb = new StringBuilder();
        sb.append("Hi ").append(firstName).append("! 👋\n\n");
        sb.append("Thanks for your interest in *").append(gymName).append("*, ").append(gymArea).append("! 🏋️\n\n");
        sb.append("We see you're aiming for *").append(goal).append("* and prefer the *").append(plan).append("* plan.\n\n");
        sb.append("Our team will reach out shortly to help you book your sessions.\n\n");
        sb.append("📍 ").append(gymArea).append("\n");
        sb.append("⭐ 500+ happy members\n\n");
        sb.append("Looking forward to your fitness journey! 🔥");

        return sb.toString();
    }

    /*
     * ── Future: Gupshup API call ─────────────────────────────────────────────
     * When you're ready to upgrade from wa.me to WhatsApp Business API:
     *
     * POST https://api.gupshup.io/sm/api/v1/msg
     * Headers:
     *   apikey: YOUR_GUPSHUP_KEY
     *   Content-Type: application/x-www-form-urlencoded
     * Body:
     *   channel=whatsapp
     *   source=91XXXXXXXXXX       ← your registered business number
     *   destination=91XXXXXXXXXX  ← lead's number
     *   src.name=FitZoneGym
     *   message={"type":"text","text":"Hi..."}
     *
     * Steps to enable:
     *   1. Sign up at gupshup.io
     *   2. Create WhatsApp app → get approved (3-5 days)
     *   3. Set WABA phone number
     *   4. Submit message templates for approval
     *   5. Replace this method with HTTP call using RestTemplate/WebClient
     *
     * Cost: ~₹0.35–0.65 per conversation (24-hr window) in India
     */
}
