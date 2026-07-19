"use client";
import {
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import NotificationBell from "@/components/shared/notification-bell";

type TopbarProps = {
  title: string;
  subtitle: string;
};

export default function Topbar({
  title,
  subtitle,
}: TopbarProps) {


  const {
    currentUser,
    setCurrentUser,
  } = useUser();


  const router = useRouter();

   
  return (
    <header
      className="
      relative
      flex
      h-16
      items-center
      justify-between
      border-b
      border-white/10
      bg-white/[0.02]
      px-8
      backdrop-blur-xl
      overflow-visible
      z-50
      "
    >
      <div>
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <p className="text-sm text-blue-100/60">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-5 px-2">

        
        {/* Notification */}
        <NotificationBell />

        
        {/* User */}

        <div
          className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          px-4
          py-2
          backdrop-blur-xl
          "
        >

          <div
            className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-cyan-500
            to-blue-600
            font-semibold
            "
          >
            {currentUser.employeeName
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)}
          </div>

          <div>
            <p className="max-w-[180px] truncate text-sm font-medium">
              {currentUser.employeeName}
            </p>

          </div>

        
        </div>

        <button
          onClick={() => {

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");

            router.replace("/");

          }}
          className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-2xl
          border
          border-red-500/20
          bg-red-500/10
          text-red-300
          transition-all
          hover:bg-red-500/20
          "
        >
          <LogOut size={18} />
        </button>

      </div>
    </header>
  );
}