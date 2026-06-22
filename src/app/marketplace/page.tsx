import type { Metadata } from "next";
import Marketplace from "@/components/Marketplace";

export const metadata: Metadata = {
  title: "Xeltrix Marketplace — Hotel Suppliers, Verified & Rated",
  description:
    "Coming soon: a B2B marketplace for the hotel industry. Find verified laundry, cleaning chemical, linen, manpower and F&B suppliers, post requirements, compare quotes and hire the best-rated — in English, Tamil & Hindi.",
  openGraph: {
    title: "Xeltrix Marketplace — Hotel Suppliers, Verified & Rated",
    description:
      "Like Upwork, but for the hotel industry. Verified suppliers, ratings, structured quotes and escrow-protected payments. Join the waitlist.",
    type: "website",
  },
};

export default function MarketplacePage() {
  return <Marketplace />;
}
