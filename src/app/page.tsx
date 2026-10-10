import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
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
