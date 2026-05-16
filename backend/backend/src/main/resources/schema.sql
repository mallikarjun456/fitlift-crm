-- ============================================================
-- FitLift MVP — MySQL Schema v1.0
-- Gym lead conversion for Pune (Hinjewadi/Wakad/Baner)
-- ============================================================

CREATE DATABASE IF NOT EXISTS lead_ai_db;
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lead_ai_db;

-- ── leads (core table — keep it lean) ────────────────────────────────────────
CREATE TABLE leads (
  id               BIGINT        AUTO_INCREMENT PRIMARY KEY,

  name             VARCHAR(100)  NOT NULL,
  phone            VARCHAR(20)   NOT NULL UNIQUE,
  email            VARCHAR(150)  NULL,

  fitness_goal     ENUM(
    'WEIGHT_LOSS',
    'MUSCLE_GAIN',
    'GENERAL_FITNESS',
    'BODYBUILDING',
    'CARDIO_STAMINA',
    'FLEXIBILITY_YOGA',
    'REHABILITATION'
  ) NOT NULL DEFAULT 'GENERAL_FITNESS',

  preferred_plan   VARCHAR(120) NOT NULL DEFAULT 'Standard',

  source           ENUM(
    'INSTAGRAM',
    'FACEBOOK',
    'GOOGLE',
    'WALK_IN',
    'REFERRAL',
    'JUSTDIAL',
    'OTHER'
  ) NOT NULL DEFAULT 'INSTAGRAM',

  status           ENUM(
    'NEW',
    'CONTACTED',
    'TRIAL_BOOKED',
    'FOLLOW_UP',
    'JOINED',
    'NOT_INTERESTED'
  ) NOT NULL DEFAULT 'NEW',

  score_value      TINYINT       NOT NULL DEFAULT 0,
  notes            TEXT          NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status       (status),
  INDEX idx_source       (source),
  INDEX idx_created_at   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── wa_log (WhatsApp message history — lightweight) ───────────────────────────
CREATE TABLE wa_log (
  id           BIGINT      AUTO_INCREMENT PRIMARY KEY,
  lead_id      BIGINT      NOT NULL,
  message_text TEXT        NOT NULL,
  sent_via     ENUM('LINK','API')  NOT NULL DEFAULT 'LINK',
  sent_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_id (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── gym_config (one row per gym — for multi-tenant later) ────────────────────
CREATE TABLE gym_config (
  id           INT         AUTO_INCREMENT PRIMARY KEY,
  gym_name     VARCHAR(100) NOT NULL DEFAULT 'FitZone Gym',
  owner_phone  VARCHAR(20)  NOT NULL,
  area         VARCHAR(50)  NOT NULL DEFAULT 'Hinjewadi',
  city         VARCHAR(50)  NOT NULL DEFAULT 'Pune',
  trial_msg    TEXT         NULL,   -- custom WhatsApp template
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed gym config ─────────────────────────────────────────────────────────
INSERT INTO gym_config (gym_name, owner_phone, area, city, trial_msg)
VALUES (
  'FitZone Gym',
  '+919876543210',
  'Hinjewadi',
  'Pune',
  'Hi {name} 👋\nThanks for your interest in FitZone Gym, Hinjewadi!\n💪 Goal: {goal}\n⏰ Plan: {plan}\n\nWe''d love to invite you for a *FREE trial session* — no commitment!\n\nReply with YES to book your trial 🔥'
);

-- ── Seed demo leads ───────────────────────────────────────────────────────────
INSERT INTO leads (name, phone, email, fitness_goal, preferred_plan, source, status, score_value, notes)
VALUES
  ('Rahul Sharma',  '+919876001001', 'rahul@gmail.com',  'WEIGHT_LOSS',      'Premium Plan',    'INSTAGRAM', 'TRIAL_BOOKED',   88, 'Interested in workout plan'),
  ('Priya Iyer',    '+919876001002', NULL,               'GENERAL_FITNESS',  'Standard Plan',   'WALK_IN',   'NEW',            62, 'Follow up needed'),
  ('Arjun Mehta',   '+919876001003', 'arjun@mail.com',   'MUSCLE_GAIN',      'Premium Plan',    'REFERRAL',  'JOINED',         95, 'Joined last week'),
  ('Sneha Desai',   '+919876001004', NULL,               'FLEXIBILITY_YOGA', 'Basic Plan',      'FACEBOOK',  'CONTACTED',      30, 'Requested pricing'),
  ('Vikram Joshi',  '+919876001005', NULL,               'BODYBUILDING',     'Premium Plan',    'INSTAGRAM', 'NEW',            91, 'High commitment'),
  ('Ananya Kulkarni','+919876001006','ananya@gmail.com', 'CARDIO_STAMINA',   'Standard Plan',   'GOOGLE',    'CONTACTED',      70, 'Looking for slot');