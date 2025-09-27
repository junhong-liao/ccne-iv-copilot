import type { Metadata } from "next";
import { CCNEFormProvider } from "@/lib/context/ccneFormContext";
import GuardedLayout from "@/components/clientside/GuardedLayout";
import Progress from "@/components/clientside/Progress";
import Breadcrumbs from "@/components/clientside/Breadcrumbs";
import FormStepper from "@/components/forms/FormStepper";

export const metadata: Metadata = {
  title: "CCNE Steps",
};

export default function CCNELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CCNEFormProvider>
      <GuardedLayout>
        <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <h1 style={{ margin: 0, fontSize: 50, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span>
              <span style={{ color: "#CDE7BE" }}>Accredit</span>
              <span style={{ color: "#a78bfa" }}>It</span>
            </span>
          </h1>
          <Progress />
          <Breadcrumbs />
          <FormStepper />
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </GuardedLayout>
    </CCNEFormProvider>
  );
}

