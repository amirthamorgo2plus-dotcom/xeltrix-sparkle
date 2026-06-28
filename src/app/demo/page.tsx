import type { Metadata } from "next";
import DemoTour from "@/components/DemoTour";

export const metadata: Metadata = {
  title: "Xeltrix Sparkle — Live Demo Hotel",
  description:
    "Try Xeltrix Sparkle right now, no login. Explore the demo hotel as a cleaner, supervisor or owner — tick checklists, mark rooms cleaned, and watch the dashboard update live.",
  openGraph: {
    title: "Xeltrix Sparkle — Live Demo Hotel",
    description:
      "Interactive demo of the hotel housekeeping app. No signup needed — switch roles and try it.",
    type: "website",
  },
};

export default function DemoPage() {
  return <DemoTour />;
}
