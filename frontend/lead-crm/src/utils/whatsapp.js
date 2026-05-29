/**
 * Reusable WhatsApp & Reminder Utility for GymSetu CRM
 */
import { parseLeadDate } from './helpers';

/**
 * Generates a wa.me URL with a prefilled welcome message.
 * Uses generic wording (no hardcoded gym name).
 * 
 * @param {Object} lead - The lead object containing name, phone, fitnessGoal
 * @returns {string} The formatted wa.me link or empty string if invalid
 */
export function getWhatsAppWelcomeLink(lead) {
  if (!lead || !lead.phone) return "";

  // Extract first name for personalization
  const firstName = lead.name ? lead.name.trim().split(/\s+/)[0] : "there";
  
  const message = `Hi ${firstName} 👋\n\nThanks for showing interest in our fitness program.\n\nWe would love to invite you for a FREE trial session this week 💪\n\nReply YES and we’ll help you schedule a convenient time.`;

  // Normalize phone number: extract digits only
  const cleanPhone = lead.phone.replace(/\D/g, "");
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Evaluates if a lead qualifies for a follow-up reminder.
 * Rules:
 * - NEW status: > 2 hours since creation
 * - CONTACTED status: > 24 hours (1 day) since creation
 * - FOLLOW_UP status: > 24 hours (1 day) since creation
 * 
 * @param {Object} lead - The lead object with status and createdAt
 * @returns {boolean} True if the lead qualifies for a reminder
 */
export function checkReminder(lead) {
  if (!lead || !lead.status || !lead.createdAt) return false;

  const elapsedMs = Date.now() - parseLeadDate(lead.createdAt).getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  switch (lead.status) {
    case "NEW":
      return elapsedHours > 2;
    case "CONTACTED":
      return elapsedHours > 24;
    case "FOLLOW_UP":
      return elapsedHours > 24;
    default:
      return false;
  }
}

/**
 * Filters a list of leads to find all that qualify for a reminder.
 * 
 * @param {Array} leads - The list of leads
 * @returns {Array} List of leads requiring action
 */
export function getReminderLeads(leads) {
  if (!Array.isArray(leads)) return [];
  return leads.filter(checkReminder);
}
