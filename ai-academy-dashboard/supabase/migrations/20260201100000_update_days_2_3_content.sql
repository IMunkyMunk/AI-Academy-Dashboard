-- Migration: Update Days 2 and 3 for 2026 AI Reality
-- Date: 2026-02-01
-- Description: Updates mission_days content for Day 2 (The Rogue Agent) and Day 3 (The Autonomous Swarm)
--              to reflect updated syllabus focusing on Constitutional AI and Multi-Agent Governance

-- ============================================================================
-- UPDATE DAY 2: The Rogue Agent
-- Focus: Constitutional AI, Agent Behavior Design, Boundary Prompting
-- ============================================================================

UPDATE mission_days
SET
  title = 'The Rogue Agent',
  codename = 'Constitutional AI',
  subtitle = 'When agents follow instructions perfectly... and still cause chaos',
  tech_skills_focus = ARRAY[
    'Constitutional AI',
    'Agent Behavior Design',
    'Boundary Prompting',
    'Escalation Patterns'
  ]
WHERE day = 2;

-- ============================================================================
-- UPDATE DAY 3: The Autonomous Swarm
-- Focus: Multi-Agent Governance, Circuit Breakers, Orchestration Patterns
-- ============================================================================

UPDATE mission_days
SET
  title = 'The Autonomous Swarm',
  codename = 'Multi-Agent Governance',
  subtitle = 'How 8 correct agents created 4,847 tickets at 3 AM',
  tech_skills_focus = ARRAY[
    'Multi-Agent Governance',
    'Circuit Breakers',
    'Orchestration vs Choreography',
    'Human-in-the-Loop Design'
  ]
WHERE day = 3;

-- ============================================================================
-- UPDATE DAY 1: Add KAF reference to tech skills
-- ============================================================================

UPDATE mission_days
SET
  tech_skills_focus = ARRAY[
    'LLM Fundamentals',
    'OpenAI/Claude/Gemini APIs',
    'Kyndryl Agentic AI Framework (KAF)'
  ]
WHERE day = 1;
