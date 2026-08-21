"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 text-red-600 text-3xl font-extrabold shadow-inner">
          !
        </div>
        <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground text-sm text-gray-500">
          We encountered an unexpected error loading this content. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-[#1A14A5] text-white hover:bg-[#231F20] rounded-xl px-6"
          >
            Try Again
          </Button>
          <Button asChild variant="outline" className="border-gray-300 rounded-xl px-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
