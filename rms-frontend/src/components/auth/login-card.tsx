import { RMSLogo } from "./rms-logo";
import { LoginForm } from "./login-form";

export function LoginCard() {
  return (
    <div
    className="
    group
    relative
    w-full
    max-w-[470px]
    overflow-hidden
    rounded-[32px]
    border
    border-white/10
    bg-[linear-gradient(180deg,rgba(30,41,59,0.70)_0%,rgba(15,23,42,0.82)_100%)]
    p-8
    backdrop-blur-3xl
    shadow-[0_50px_180px_rgba(37,99,235,0.40)]
    transition-all
    duration-500
    hover:-translate-y-1
    hover:shadow-[0_70px_220px_rgba(37,99,235,0.55)]
    "
    >
      {/* Border Glow */}
      <div
        className="
        pointer-events-none
        absolute
        inset-0
        rounded-[36px]
        border
        border-cyan-300/10
        transition-all
        duration-500
        group-hover:border-cyan-300/20
      "
      />
      
        {/* Inner Blue Glow */}
        <div
            className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]
        "
        />

        {/* Glass Reflection */}
        <div
            className="
            pointer-events-none
            absolute
            left-0
            top-0
            h-40
            w-full
            bg-gradient-to-r
            from-white/15
            via-white/8
            to-transparent
            blur-xl
        "
        />

        <RMSLogo />
      <LoginForm />
    </div>
  );
}