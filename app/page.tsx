import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import { Features } from "@/components/layout/Features";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
