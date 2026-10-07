import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
