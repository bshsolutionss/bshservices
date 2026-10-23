import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import PublicLeadForm from "@/components/PublicLeadForm";
import type { LeadForm } from "@/lib/lead-forms";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: form } = await createServiceRoleClient().from("lead_forms").select("*").eq("slug", slug).maybeSingle<LeadForm>();
  if (!form) notFound();

  if (!form.active) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8F6] px-5 text-center">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">This form is paused</h1>
          <p className="mt-1 text-sm text-stone-500">It isn&apos;t taking responses right now. Please contact us another way.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-5 py-12">
      <PublicLeadForm slug={form.slug} heading={form.heading} intro={form.intro} thankYou={form.thank_you} questions={form.questions} />
    </main>
  );
}
