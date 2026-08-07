import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security check",
  robots: { index: false, follow: false },
};

export default function SecurityCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
