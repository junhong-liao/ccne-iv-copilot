import type { Metadata } from "next";
import FooterNav from "@/components/forms/navigation/FooterNav";
import ReviewSummary from "@/components/review/ReviewSummary";

export const metadata: Metadata = {
  title: "Review",
};

export default function Page() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div>
        <h2>Review & confirm</h2>
        <p style={{ color: "#4b5563", fontSize: 15 }}>
          Double-check each section before proceeding to submission. Use the edit controls to make adjustments on the
          relevant step.
        </p>
      </div>
      <ReviewSummary />
      <FooterNav currentPath="/review" />
    </div>
  );
}
