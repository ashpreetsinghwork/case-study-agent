import type { Metadata } from "next";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { PortfolioScorer } from "@/components/site/portfolio-scorer";

export const metadata: Metadata = {
  title: "The 90-Second Score",
  description: "Thirty checks across six themes. Score your portfolio in 90 seconds.",
};

export default function ScorePage() {
  return (
    <>
      <Nav />
      <main>
        <PortfolioScorer />
      </main>
      <Footer />
    </>
  );
}
