import type { Metadata } from "next";
import ProgramInfoForm from "@/components/forms/ProgramInfoForm";
import FooterNav from "@/components/forms/navigation/FooterNav";

export const metadata: Metadata = {
  title: "Step 1",
};

export default function Page() {
  return (
    <div>
      <h2>Step 1</h2>
      <ProgramInfoForm />
      <FooterNav currentPath="/step1" />
    </div>
  );
}


