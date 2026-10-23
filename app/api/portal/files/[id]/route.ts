import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Sends the client to a short-lived signed link for a document that is shared with them. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;

  const service = createServiceRoleClient();
  const { data: doc } = await service
    .from("documents")
    .select("storage_path, file_name, client_id, shared")
    .eq("id", id)
    .maybeSingle();
  // Same response for "not yours" and "doesn't exist" so ids can't be probed.
  if (!doc || doc.client_id !== auth.session.clientId || !doc.shared) {
    return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  }
  const { data, error } = await service.storage.from("portal-files").createSignedUrl(doc.storage_path, 60, { download: doc.file_name });
  if (error || !data) return NextResponse.json({ ok: false, error: "Could not open the file." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
