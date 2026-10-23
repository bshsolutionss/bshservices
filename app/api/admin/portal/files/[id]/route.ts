import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Lets the team open any uploaded document, including ones hidden from the client. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;

  const service = createServiceRoleClient();
  const { data: doc } = await service.from("documents").select("storage_path, file_name").eq("id", id).maybeSingle();
  if (!doc) return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  const { data, error } = await service.storage.from("portal-files").createSignedUrl(doc.storage_path, 60, { download: doc.file_name });
  if (error || !data) return NextResponse.json({ ok: false, error: "Could not open the file." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
