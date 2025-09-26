import type { Metadata } from "next";
import NextButton from "@/components/clientside/NextButton";

export const metadata: Metadata = {
  title: "Step 2",
};

export default function Page() {
  return (
    <div>
      <h2>Step 2</h2>
      <p>Placeholder content for Step 2.</p>
      <NextButton currentPath="/step2" nextPath="/step3" />
    </div>
  );
}


