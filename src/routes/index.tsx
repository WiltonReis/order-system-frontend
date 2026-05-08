import { createFileRoute, redirect } from "@tanstack/react-router";
import { userStorage } from "@/lib/api";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "OMS — Gestão de Pedidos" }],
  }),
  beforeLoad: () => {
    if (userStorage.get()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
