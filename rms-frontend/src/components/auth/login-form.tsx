"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { authService } from "@/services/auth.service";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from "lucide-react";

export function LoginForm() {
    const router = useRouter();

    const { setCurrentUser } =
  useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const validateForm = () => {
  let isValid = true;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
  setEmailError("Email is required");
  emailInputRef.current?.focus();
  isValid = false;
  } else if (!emailRegex.test(email)) {
  setEmailError("Please enter a valid email");
  emailInputRef.current?.focus();
  isValid = false;
  }

  if (!password.trim()) {
    setPasswordError("Password is required");

    if (email.trim()) {
        passwordInputRef.current?.focus();
    }

    isValid = false;
  } else if (password.length < 6) {
    setPasswordError(
      "Password must be at least 6 characters"
    );
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  setLoginError("");

  if (!validateForm()) return;

  setIsLoading(true);

  try {

  const response =
    await authService.login({
      email,
      password,
    });

    console.log(
  "LOGIN USER =>",
  response.user
);

  console.log(
  "LOGIN RESPONSE =>",
  JSON.stringify(
    response,
    null,
    2
  )
);

console.log(
  "USER PERMISSIONS =>",
  response.user.permissions
);  

  localStorage.setItem(
    "access_token",
    response.access_token
  );

  localStorage.setItem(
    "refresh_token",
    response.refresh_token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(response.user)
  );

  setCurrentUser({
    employeeId:
      response.user.employee_id ||
      response.user.id,

    employeeName:
      response.user.full_name,

    email:
      response.user.email,

    role:
      response.user.roles?.[0] ?? "",


    permissions:
      response.user.permissions ?? [],
  });

  router.push("/dashboard");

} catch (error: any) {

  setLoginError(
    error?.response?.data?.error
      ?.detail ??
    "Invalid email or password"
  );

} finally {

  setIsLoading(false);

}
};

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key === "Enter") {
    handleLogin();
  }
};

  return (
    <div className="mt-8 space-y-5">
      {/* Email */}
      <div className="space-y-2">
        
        <div
         className={`
            group
            relative
            flex
            h-14
            items-center
            gap-3
            rounded-2xl
            border
            ${
            emailError
                ? "border-red-400/60 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                : "border-white/10"
            }
            bg-white/[0.04]
            px-4
            backdrop-blur-3xl
            shadow-inner
            transition-all
            duration-300
            hover:border-cyan-400/30
            focus-within:border-cyan-400/50
            focus-within:shadow-[0_0_18px_rgba(34,211,238,0.12)]
         `}
        >
          <Mail
            size={18}
            className={`
            transition-all
            duration-300
            ${
            emailError
                ? "text-red-400"
                : "text-blue-200/70"
            }
            group-focus-within:text-cyan-300
            group-focus-within:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]
         `}
        />

          <input
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder=" "
            className="
            peer
            w-full
            bg-transparent
            pt-5
            text-white
            outline-none
            focus:outline-none
            "
            />

          <label
            className="
            pointer-events-none
            absolute
            left-12
            top-1/2
            -translate-y-1/2
            text-white/45
            transition-all
            duration-300

            peer-focus:top-4
            peer-focus:text-xs
            peer-focus:text-cyan-300

            peer-[:not(:placeholder-shown)]:top-4
            peer-[:not(:placeholder-shown)]:text-xs
            "
          >
            Email Address
          </label>

          <div
            className="
            absolute
            bottom-0
            left-1/2
            h-[2px]
            w-0
            -translate-x-1/2
            rounded-full
            bg-cyan-400
            shadow-[0_0_12px_rgba(34,211,238,0.8)]
            transition-all
            duration-300
            peer-focus:w-[50%]
            peer-focus:opacity-100
            opacity-0
            "
          />
          
        </div>
      </div>
      {emailError && (
        <p className="ml-2 text-sm text-red-400">
          {emailError}
        </p>
      )}

      {/* Password */}
      <div className="space-y-2">

        <div
            className={`
                group
                relative
                flex
                h-14
                items-center
                gap-3
                rounded-2xl
                border
                ${
                passwordError
                    ? "border-red-400/60 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                    : "border-white/10"
                }
                bg-white/[0.04]
                px-4
                backdrop-blur-3xl
                shadow-inner
                transition-all
                duration-300
                hover:border-cyan-400/30
                focus-within:border-cyan-400/50
                focus-within:shadow-[0_0_18px_rgba(34,211,238,0.12)]
            `}
            >
          <Lock
            size={18}
            className={`
                transition-all
                duration-300
                ${
                passwordError
                    ? "text-red-400"
                    : "text-blue-200/70"
                }
                group-focus-within:text-cyan-300
                group-focus-within:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]
            `}
            />

          <input
            ref={passwordInputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder=" "
            className="
            peer
            w-full
            bg-transparent
            pt-5
            text-white
            outline-none
            focus:outline-none
            "
            />

          <label
            className="
            pointer-events-none
            absolute
            left-12
            top-1/2
            top-[18px]
            text-white/45
            transition-all
            duration-300

            peer-focus:top-[10px]
            peer-focus:text-xs
            peer-focus:text-cyan-300

            peer-[:not(:placeholder-shown)]:top-[10px]
            peer-[:not(:placeholder-shown)]:text-xs
            "
          >
            Password
          </label>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
            transition-all
            duration-300
            hover:scale-110
            "
            >
            {showPassword ? (
                <EyeOff
                size={18}
                className="text-cyan-300"
                />
            ) : (
                <Eye
                size={18}
                className="text-blue-200/60"
                />
            )}
            </button>
          <div
            className="
            absolute
            bottom-0
            left-1/2
            h-[2px]
            w-0
            -translate-x-1/2
            rounded-full
            bg-cyan-400
            shadow-[0_0_12px_rgba(34,211,238,0.8)]
            transition-all
            duration-300
            peer-focus:w-[50%]
            peer-focus:opacity-100
            opacity-0
          "
          />

        </div>
      </div>
      {passwordError && (
        <p className="ml-2 text-sm text-red-400">
            {passwordError}
        </p>
      )}

      {loginError && (
        <div
            className="
            rounded-xl
            border
            border-red-400/30
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-300
            "
        >
            {loginError}
        </div>
        )}

      {/* Remember */}
      <div className="flex items-center justify-between">
        <label
            onClick={() => setRememberMe(!rememberMe)}
            className="
            flex
            cursor-pointer
            items-center
            gap-3
            text-sm
            text-white/70
            "
            >
            <div
                className={`
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-md
                border
                transition-all
                duration-300
                ${
                    rememberMe
                    ? "border-cyan-400 bg-cyan-400/20"
                    : "border-white/20 bg-white/5"
                }
                `}
            >
                <Check
                size={12}
                className={`
                    transition-all
                    duration-300
                    ${
                    rememberMe
                        ? "scale-100 text-cyan-300"
                        : "scale-0"
                    }
                `}
                />
            </div>

            Remember me
            </label>

        <button
          className="
          text-sm
          text-blue-300
          transition
          hover:text-cyan-300
        "
        >
          Forgot password?
        </button>
      </div>

      {/* Sign In */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`
        relative
        h-14
        w-full
        overflow-hidden
        rounded-2xl
        bg-gradient-to-r
        from-cyan-500
        via-blue-500
        to-violet-500
        font-semibold
        text-white
        shadow-[0_15px_50px_rgba(59,130,246,0.45)]
        transition-all
        duration-300

        ${
        isLoading
            ? "cursor-not-allowed opacity-80"
            : "hover:scale-[1.02]"
        }
        `}
      >
        <span
            className="
            relative
            z-10
            flex
            items-center
            justify-center
            gap-2
            "
            >
            {isLoading && (
                <Loader2
                size={18}
                className="animate-spin"
                />
            )}

            {isLoading ? "Signing In..." : "Sign In"}
            </span>

        <span
            className="
            absolute
            top-0
            left-[-120%]
            h-full
            w-[40%]
            rotate-12
            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
            animate-[shine_3s_linear_infinite]
            "
        />
      </button>
    </div>
  );
}