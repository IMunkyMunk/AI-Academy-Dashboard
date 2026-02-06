'use client';

import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Database,
  Blocks,
  Cpu,
  Users,
  Rocket,
  GraduationCap,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  available: boolean;
}

interface Module {
  title: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
  borderColor: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    title: 'AI Foundations',
    description: 'Understanding the AI landscape and your role in it',
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    lessons: [
      {
        id: 1,
        title: 'The New Reality',
        description: 'AI Landscape 2026, T-Shaped Learning, The 7 AI Roles, KAF Framework',
        available: true,
      },
    ],
  },
  {
    title: 'Security & Compliance',
    description: 'Protecting AI systems in enterprise environments',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    lessons: [
      {
        id: 2,
        title: 'AI Security Fundamentals',
        description: 'OWASP Top 10 for LLMs, Code Analysis, Secure Authentication with Clerk',
        available: true,
      },
    ],
  },
  {
    title: 'Data & Infrastructure',
    description: 'Databases, memory systems, and data pipelines for agents',
    icon: Database,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    lessons: [
      {
        id: 3,
        title: 'Databases & Memory for Agents',
        description: 'PostgreSQL, Vector databases, Supabase, Agent memory management',
        available: true,
      },
    ],
  },
  {
    title: 'Architecture & Governance',
    description: 'Designing scalable and governed AI systems',
    icon: Blocks,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    lessons: [
      {
        id: 4,
        title: 'System Design & Governance Blueprint',
        description: 'Architecture patterns, governance frameworks, enterprise AI design',
        available: true,
      },
      {
        id: 5,
        title: 'From Governance to Agent Design Patterns',
        description: 'Agent patterns, multi-agent orchestration, practical implementation',
        available: true,
      },
    ],
  },
  {
    title: 'Role Specialization',
    description: 'Deep dive into your chosen AI role',
    icon: Cpu,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    lessons: [
      { id: 6, title: 'Role Deep Dive I', description: 'Specialization fundamentals', available: false },
      { id: 7, title: 'Role Deep Dive II', description: 'Advanced role techniques', available: false },
      { id: 8, title: 'Role Deep Dive III', description: 'Real-world scenarios', available: false },
      { id: 9, title: 'Role Deep Dive IV', description: 'Cross-functional skills', available: false },
      { id: 10, title: 'Role Deep Dive V', description: 'Role mastery assessment', available: false },
    ],
  },
  {
    title: 'Advanced AI Skills',
    description: 'Self-paced advanced topics and certification prep',
    icon: Rocket,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    lessons: [
      { id: 11, title: 'Advanced Topic I', description: 'Self-paced learning', available: false },
      { id: 12, title: 'Advanced Topic II', description: 'Exploration & research', available: false },
      { id: 13, title: 'Advanced Topic III', description: 'Certification prep', available: false },
      { id: 14, title: 'Advanced Topic IV', description: 'Industry best practices', available: false },
      { id: 15, title: 'Advanced Topic V', description: 'Practical workshops', available: false },
    ],
  },
  {
    title: 'Team Projects',
    description: 'Cross-functional teams building production-ready AI solutions',
    icon: Users,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    lessons: [
      { id: 16, title: 'Project Kickoff', description: 'Team formation & project planning', available: false },
      { id: 17, title: 'Sprint I', description: 'Initial development', available: false },
      { id: 18, title: 'Sprint II', description: 'Core features', available: false },
      { id: 19, title: 'Sprint III', description: 'Integration & testing', available: false },
      { id: 20, title: 'Sprint IV', description: 'Polish & documentation', available: false },
    ],
  },
  {
    title: 'Hackathon & Graduation',
    description: 'Final challenge, client presentations, and certification',
    icon: GraduationCap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    lessons: [
      { id: 21, title: 'Hackathon Prep', description: 'Challenge briefing', available: false },
      { id: 22, title: 'Hackathon Day I', description: 'Building solutions', available: false },
      { id: 23, title: 'Hackathon Day II', description: 'Finishing touches', available: false },
      { id: 24, title: 'Presentations', description: 'Client demo day', available: false },
      { id: 25, title: 'Graduation', description: 'Certification & next steps', available: false },
    ],
  },
];

export function AcademyPortal() {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const availableLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.available).length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0062FF]">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">AI Academy</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Kyndryl AI Training Program &middot; {availableLessons} of {totalLessons} lessons available
        </p>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <div key={module.title} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${module.bgColor}`}>
                  <Icon className={`h-5 w-5 ${module.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{module.title}</h2>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
              </div>

              {/* Lessons */}
              <div className="grid gap-2 sm:gap-3">
                {module.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    moduleColor={module.color}
                    moduleBorderColor={module.borderColor}
                    moduleBgColor={module.bgColor}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  moduleColor,
  moduleBorderColor,
  moduleBgColor,
}: {
  lesson: Lesson;
  moduleColor: string;
  moduleBorderColor: string;
  moduleBgColor: string;
}) {
  if (!lesson.available) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3 opacity-50">
        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{lesson.title}</p>
          <p className="text-xs text-muted-foreground/70 truncate">{lesson.description}</p>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <Link href={`/academy/lesson/${lesson.id}`}>
      <div className={`flex items-center gap-3 rounded-lg border ${moduleBorderColor} ${moduleBgColor} px-4 py-3 transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer group`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 ${moduleColor} font-bold text-sm flex-shrink-0`}>
          {lesson.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{lesson.title}</p>
          <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
        </div>
        <ArrowRight className={`h-4 w-4 ${moduleColor} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
      </div>
    </Link>
  );
}
