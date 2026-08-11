/**
 * Generated (not hand-authored) copy for the service detail template.
 *
 * These sections are legitimately similar in *structure* across a category
 * (e.g. "how we work" has the same 4 stages for every development service),
 * so instead of duplicating near-identical paragraphs 30 times in
 * `services-data.ts`, we generate them from the category + service name.
 * The output text is still specific to the service being viewed.
 */
import type { ServiceCategorySlug, ServiceDefinition } from "@/lib/services-data";

export interface ProcessStep {
  title: string;
  description: string;
}

const PROCESS_TEMPLATES: Record<ServiceCategorySlug, (name: string) => ProcessStep[]> = {
  development: (name) => [
    { title: "Discovery & Scoping", description: `We review your goals, existing systems, and requirements for ${name}, then define a clear scope and timeline.` },
    { title: "Design & Architecture", description: `We plan the technical architecture and UI approach so ${name} is built on a scalable, maintainable foundation.` },
    { title: "Build & Iterate", description: `Our developers build ${name} in focused sprints, with regular check-ins so you can review progress and give feedback.` },
    { title: "Launch & Support", description: "We test thoroughly, deploy to production, and stay on for post-launch monitoring and support." },
  ],
  designing: (name) => [
    { title: "Discovery & Research", description: `We learn about your brand, audience, and goals to ground ${name} in real strategy, not guesswork.` },
    { title: "Concept & Direction", description: `We explore initial directions for ${name} and narrow in on the concept that best fits your brand.` },
    { title: "Design & Refine", description: `We develop the chosen concept in full detail, refining ${name} through structured feedback rounds.` },
    { title: "Deliver & Handover", description: `You receive final, production-ready files for ${name} along with usage guidelines.` },
  ],
  marketing: (name) => [
    { title: "Audit & Research", description: `We audit your current performance and research your market to build a ${name} strategy grounded in data.` },
    { title: "Strategy & Setup", description: `We define targeting and messaging, then set up tracking so every ${name} result is measurable.` },
    { title: "Launch & Optimize", description: `We launch your ${name} campaigns and continuously test and optimize based on real performance data.` },
    { title: "Report & Scale", description: `You get clear, regular reporting on ${name}, and we scale what's working.` },
  ],
  photography: (name) => [
    { title: "Brief & Planning", description: `We discuss your vision, shot list, and logistics to plan every detail of your ${name} session.` },
    { title: "Pre-Production", description: `We handle location scouting, equipment prep, and scheduling ahead of the ${name} shoot.` },
    { title: "Shoot Day", description: `Our team captures your ${name} with professional lighting, direction, and equipment.` },
    { title: "Edit & Deliver", description: "We edit and retouch every selected image or clip and deliver final files ready to publish." },
  ],
  ai: (name) => [
    { title: "Audit & Discovery", description: `We map your current workflows to identify exactly where ${name} will save the most time and cost.` },
    { title: "Solution Design", description: `We design the ${name} workflow and select the right tools and integrations for your stack.` },
    { title: "Build & Test", description: `We build and rigorously test ${name} against real scenarios before it touches live operations.` },
    { title: "Deploy & Monitor", description: `We deploy ${name}, train your team, and monitor performance to fine-tune results.` },
  ],
};

export function getProcessSteps(service: ServiceDefinition): ProcessStep[] {
  return PROCESS_TEMPLATES[service.category](service.name);
}

const WHY_CHOOSE_US: Record<ServiceCategorySlug, string[]> = {
  development: [
    "Senior developers only — no outsourced juniors learning on your project.",
    "Clean, documented code you fully own — no vendor lock-in.",
    "Launch support and post-go-live monitoring included.",
    "Transparent, fixed-scope quotes with no surprise change fees.",
  ],
  designing: [
    "In-house designers who understand both aesthetics and conversion.",
    "Structured revision rounds until you're genuinely happy with the result.",
    "Full source files handed over — you own every asset.",
    "Fast turnaround without cutting corners on quality.",
  ],
  marketing: [
    "Data-driven strategy, not guesswork — every decision backed by analytics.",
    "Transparent, regular reporting so you always know your ROI.",
    "Specialists across Google, Meta, and SEO tooling.",
    "Flexible engagements — no long lock-in contracts.",
  ],
  photography: [
    "Professional-grade equipment and licensed drone operators.",
    "Fast turnaround on edited, ready-to-publish files.",
    "On-location or studio sessions to fit your schedule.",
    "Consistent visual style across every deliverable.",
  ],
  ai: [
    "Practical automations that pay for themselves in saved hours.",
    "No-code and custom-code solutions matched to your budget.",
    "Ongoing support as your workflows and tools evolve.",
    "Security-first integrations that respect your data.",
  ],
};

export function getWhyChooseUs(category: ServiceCategorySlug): string[] {
  return WHY_CHOOSE_US[category];
}

export function getCtaContent(service: ServiceDefinition): { heading: string; subtext: string } {
  return {
    heading: `Ready to get started with ${service.name.toLowerCase()}?`,
    subtext: `Tell us about your project and we'll follow up with next steps for ${service.name.toLowerCase()} — no obligation.`,
  };
}
