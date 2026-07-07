import Image from "next/image";

export function RMSLogo() {
  return (
    <div className="text-center">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <div
          className="
          relative
          flex
          items-center
          justify-center
        "
        >
          {/* Outer Glow */}
          <div
            className="
            absolute
            h-28
            w-28
            rounded-3xl
            bg-cyan-400/40
            blur-[75px]
          "
          />

          <Image
            src="/logo.png"
            alt="RMS Logo"
            width={80}
            height={80}
            className="
              relative
              z-10
              rounded-3xl
              shadow-[0_0_60px_rgba(34,211,238,0.45)]
            "
            priority
          />
        </div>
      </div>

      {/* Product Name */}
      <h1
        className="
        text-[56px]
        font-bold
        tracking-[-0.04em]
        text-white
        drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]
      "
      >
        RMS
      </h1>

      {/* Subtitle */}
      <p
        className="
        mt-2
        text-[15px]
        text-blue-100/70
        tracking-[0.08em]
        uppercase
      "
      >
        Reimbursement Management System
      </p>

      {/* Divider */}
      <div
        className="
        mx-auto
        mt-4
        h-px
        w-56
        bg-gradient-to-r
        from-transparent
        via-cyan-300
        to-transparent
      "
      />
    </div>
  );
}