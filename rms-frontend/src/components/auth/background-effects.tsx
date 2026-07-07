export function BackgroundEffects() {
  return (
    <>
      {/* Base Background */}
      <div className="absolute inset-0 bg-[#030B1F]" />

      {/* Main Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(96,165,250,0.20),transparent_30%),radial-gradient(circle_at_80%_85%,rgba(99,102,241,0.25),transparent_35%)]" />

            {/* LEFT PLANET */}
        <div
        className="
        absolute
        -left-[750px]
        top-[40px]
        h-[1800px]
        w-[1800px]
        rounded-full
        border
        border-blue-300/15
        bg-gradient-to-br
        from-blue-500/50
        via-blue-700/20
        to-transparent
        "
        />

      {/* LEFT PLANET GLOW */}
        <div
        className="
        absolute
        -left-[500px]
        top-[120px]
        h-[1400px]
        w-[1400px]
        rounded-full
        bg-blue-500/40
        blur-[220px]
        "
        />

      {/* PLANET EDGE */}
        <div
        className="
        absolute
        -left-[680px]
        top-[100px]
        h-[1700px]
        w-[1700px]
        rounded-full
        border
        border-cyan-300/10
        "
        />

      {/* RIGHT PLANET */}
        <div
        className="
        absolute
        -right-[450px]
        bottom-[-350px]
        h-[1300px]
        w-[1300px]
        rounded-full
        bg-gradient-to-br
        from-violet-500/30
        via-blue-500/20
        to-transparent
        blur-2xl
        "
        />

      {/* CENTER ATMOSPHERE */}
        <div
        className="
        absolute
        left-1/2
        top-1/2
        h-[1800px]
        w-[1800px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        bg-blue-500/35
        blur-[220px]
        "
        />

      {/* LIGHT BEAM */}
      <div
        className="
        absolute
        right-0
        top-0
        h-full
        w-[40%]
        bg-gradient-to-bl
        from-blue-300/10
        via-transparent
        to-transparent
      "
      />

      {/* STARS */}
      <div className="absolute left-[12%] top-[38%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_40px_12px_rgba(34,211,238,0.8)]" />

      <div className="absolute left-[68%] top-[58%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_40px_12px_rgba(96,165,250,0.8)]" />

      <div className="absolute right-[18%] top-[28%] h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_40px_12px_rgba(129,140,248,0.8)]" />

      <div className="absolute left-[35%] top-[18%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_25px_6px_rgba(255,255,255,0.8)]" />

      <div className="absolute right-[30%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_25px_6px_rgba(255,255,255,0.8)]" />

      {/* PREMIUM MESH */}
      <div className="absolute bottom-[-320px] left-[-350px] opacity-80">
        <div className="h-[1100px] w-[2400px] rounded-full border border-cyan-400/20" />

        <div className="absolute left-[120px] top-[80px] h-[950px] w-[2100px] rounded-full border border-cyan-400/15" />

        <div className="absolute left-[240px] top-[160px] h-[800px] w-[1800px] rounded-full border border-cyan-400/10" />
      </div>

      {/* GRID NOISE */}
      <div
        className="
        absolute
        inset-0
        opacity-[0.05]
        [background-image:radial-gradient(#ffffff_1px,transparent_1px)]
        [background-size:26px_26px]
      "
      />
    </>
  );
}