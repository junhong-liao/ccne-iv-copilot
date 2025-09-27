import type { Metadata } from "next";
import FooterNav from "@/components/forms/navigation/FooterNav";
import SubmissionPanel from "@/components/review/SubmissionPanel";

export const metadata: Metadata = {
  title: "Submit",
};

export default function Page() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <SubmissionPanel />
      <FooterNav currentPath="/submit" />
    </div>
  );
}
