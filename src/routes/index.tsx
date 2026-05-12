import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Header } from "@/shared/components/layout/Header";
import { Hero } from "@/features/landing/components/Hero";
import { Features } from "@/features/landing/components/Features";
import { TechStack } from "@/features/landing/components/TechStack";
import { Footer } from "@/features/landing/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "OMS — Gestão de Pedidos" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Header />}
      <Hero />
      <Features />
      <TechStack />
      <Footer />
    </div>
  );
}
