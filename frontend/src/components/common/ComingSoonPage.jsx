import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

/**
 * Shared placeholder shell for every module not yet built out.
 * Keeps the sidebar fully navigable from Phase 1 onward (per the
 * roadmap: "sidebar should already include links for all modules,
 * even if some pages are placeholders initially") without each page
 * reinventing its own empty layout.
 */
export function ComingSoonPage({ title, description, icon, phaseNote }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="This module is coming soon"
        description={phaseNote}
      />
    </div>
  );
}
