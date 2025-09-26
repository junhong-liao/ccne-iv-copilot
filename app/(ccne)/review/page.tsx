import type { Metadata } from "next";
import NextButton from "@/components/clientside/NextButton";

export const metadata: Metadata = {
  title: "Review",
};

export default function Page() {
  return (
    <div>
      <h2>Review</h2>
      <p>Placeholder review summary.</p>
      <NextButton currentPath="/review" nextPath="/submit" />
    </div>
  );
}


