import type { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { attachmentRedirect } from "@/lib/portal/chat";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  return attachmentRedirect(id);
}
