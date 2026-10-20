import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { CommunityBanner } from "@/components/site/community-banner";
import { Pipeline } from "@/components/site/pipeline";
import { Outputs } from "@/components/site/outputs";
import { AgentDemo } from "@/components/site/agent-demo";
import { Review } from "@/components/site/review";
import { FinalCta } from "@/components/site/final-cta";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <section className="px-4 py-16 sm:px-6">
          <CommunityBanner size="full" source="homepage" />
        </section>
        <Pipeline />
        <Outputs />
        <AgentDemo />
        <Review />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
