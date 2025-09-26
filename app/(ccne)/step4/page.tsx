import type { Metadata } from "next";
import NextButton from "@/components/clientside/NextButton";

export const metadata: Metadata = {
  title: "Step 4",
};

export default function Page() {
  return (
    <div>
      <h2>Step 4</h2>
      <p>Placeholder content for Step 4.</p>
      <NextButton currentPath="/step4" nextPath="/review" />
    </div>
  );
}


