import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 text-[#1A14A5] text-3xl font-extrabold shadow-inner">
          404
        </div>
        <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground text-sm text-gray-500">
          The page or article you are looking for might have been moved, deleted, or doesn&apos;t exist.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild className="bg-[#1A14A5] text-white hover:bg-[#231F20] rounded-xl px-6">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 rounded-xl px-6">
            <Link href="/blog">Browse Blog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
