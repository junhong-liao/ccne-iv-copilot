import type { Metadata } from "next";
import IVAEvidenceForm from "@/components/forms/IVAEvidenceForm";
import FooterNav from "@/components/forms/navigation/FooterNav";

export const metadata: Metadata = {
  title: "Step 4",
};

export default function Page() {
  return (
    <div>
      <h2>Step 4</h2>
      <IVAEvidenceForm />
      <FooterNav currentPath="/step4" />
    </div>
  );
}

