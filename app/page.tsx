import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { ValueSection } from "@/components/landing/value-section";
import { BackgroundEffects } from "@/components/landing/background-effects";
import { Reveal } from "@/components/landing/reveal";

export default function Home() {
  return <><BackgroundEffects /><Navbar /><main><Hero /><Reveal className="product-float"><DashboardPreview /></Reveal><Reveal><Features /></Reveal><Reveal><ValueSection /></Reveal><Reveal><FinalCta /></Reveal></main><Footer /></>;
}