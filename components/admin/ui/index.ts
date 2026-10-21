/**
 * The admin design system. Import from here (not the individual files) so a
 * screen picks up the shared primitives rather than re-styling its own.
 *
 * Server and client components can both import this barrel — the
 * interactive pieces (Modal, Fields) carry their own "use client".
 */
export { default as Modal } from "./Modal";
export { default as ConfirmButton } from "./ConfirmButton";
export { default as Stepper, type StepDefinition } from "./Stepper";
export { default as Badge } from "./Badge";
export { default as SectionCard } from "./SectionCard";
export { default as StatCard } from "./StatCard";
export { default as Alert } from "./Alert";
export { default as EmptyState } from "./EmptyState";
export { default as PageHeader } from "./PageHeader";
export { default as AdvancedSection } from "./AdvancedSection";
export { useToast } from "./Toast";
export * from "./Fields";
export * from "./styles";
