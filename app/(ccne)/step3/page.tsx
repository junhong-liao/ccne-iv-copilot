import type { Metadata } from "next";
import ELAForm from "@/components/forms/ELAForm";
import FooterNav from "@/components/forms/navigation/FooterNav";

export const metadata: Metadata = {
  title: "Step 3",
};

export default function Page() {
  return (
    <div>
      <h2>Step 3</h2>
      <ELAForm />
      <FooterNav currentPath="/step3" />
    </div>
  );
}

