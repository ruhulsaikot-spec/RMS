import { BackgroundEffects } from "@/components/auth/background-effects";
import { LoginCard } from "@/components/auth/login-card";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">

        {/* Aurora Glow */}
        <div
          className="
          absolute
          h-[900px]
          w-[900px]
          rounded-full
          bg-cyan-500/15
          blur-[180px]
          animate-pulse
        "
        />

        <div
          className="
          absolute
          h-[700px]
          w-[700px]
          rounded-full
          bg-violet-500/10
          blur-[200px]
        "
        />

        <LoginCard />

      </div>
    </main>
  );
}