import type { Metadata } from "next";
import NextButton from "@/components/clientside/NextButton";

export const metadata: Metadata = {
  title: "Step 1",
};

export default function Page() {
  return (
    <div>
      <h2>Step 1</h2>
      <p>Placeholder content for Step 1.</p>
      <NextButton currentPath="/step1" nextPath="/step2" />
    </div>
  );
}


