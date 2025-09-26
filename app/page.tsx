import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>CCNE IV Copilot</h1>
      <p>Start the multi-step flow.</p>
      <Link href="/step1" style={{ color: "#0ea5e9" }}>Begin</Link>
    </main>
  );
}


