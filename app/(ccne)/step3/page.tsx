import type { Metadata } from "next";
import NextButton from "@/components/clientside/NextButton";

export const metadata: Metadata = {
  title: "Step 3",
};

export default function Page() {
  return (
    <div>
      <h2>Step 3</h2>
      <p>Placeholder content for Step 3.</p>
      <NextButton currentPath="/step3" nextPath="/step4" />
    </div>
  );
}


