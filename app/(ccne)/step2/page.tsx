import type { Metadata } from "next";
import CohortWindowForm from "@/components/forms/CohortWindowForm";
import FooterNav from "@/components/forms/navigation/FooterNav";

export const metadata: Metadata = {
  title: "Step 2",
};

export default function Page() {
  return (
    <div>
      <h2>Step 2</h2>
      <CohortWindowForm />
      <FooterNav currentPath="/step2" />
    </div>
  );
}

