"use client";

import { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotMessage("Please enter your email address."); return; }
    try {
      setForgotLoading(true);
      setForgotMessage("");
      await apiClient.post("/auth/password-reset/request", { email: forgotEmail });
      setForgotStep("reset");
      setForgotMessage("An OTP has been sent to your email. Please check your inbox.");
    } catch (error: any) {
      const detail = error?.response?.data?.detail ||
                     error?.response?.data?.error?.detail ||
                     "Failed to send reset email.";
      setForgotMessage(detail);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmNewPassword) {
      setForgotMessage("Please fill in all fields."); return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotMessage("Passwords do not match."); return;
    }
    if (newPassword.length < 8) {
      setForgotMessage("Password must be at least 8 characters."); return;
    }
    try {
      setForgotLoading(true);
      setForgotMessage("");
      await apiClient.post("/auth/password-reset/confirm", {
        token: resetToken,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });
      setForgotMessage("Password reset successfully! Please login with your new password.");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep("email");
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotMessage("");
        // Clear any existing session
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }, 2500);
    } catch (error: any) {
      const detail = error?.response?.data?.detail || 
                     error?.response?.data?.error?.detail || 
                     "Failed to reset password.";
      setForgotMessage(detail);
    } finally {
      setForgotLoading(false);
    }
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
            autoComplete="email"
            className="
            peer
            w-full
            bg-transparent
            pt-5
            text-white
            outline-none
            focus:outline-none
            [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_transparent_inset]
            [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]
            [&:-webkit-autofill]:[-webkit-text-fill-color:white]
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
            autoComplete="current-password"
            className="
            peer
            w-full
            bg-transparent
            pt-5
            text-white
            outline-none
            focus:outline-none
            [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_transparent_inset]
            [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]
            [&:-webkit-autofill]:[-webkit-text-fill-color:white]
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

        <button type="button" onClick={() => { setShowForgotModal(true); setForgotStep("email"); setForgotMessage(""); }}
                className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
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
    {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {forgotStep === "email" ? "Forgot Password" : "Reset Password"}
                </h2>
                <p className="text-xs text-white/40">
                  {forgotStep === "email"
                    ? "Enter your email to receive a one-time OTP"
                    : "Enter the OTP from your email and set new password"}
                </p>
              </div>
              <button
                onClick={() => { setShowForgotModal(false); setForgotStep("email"); setForgotMessage(""); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                ✕
              </button>
            </div>

            {forgotStep === "email" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                {forgotMessage && (
                  <p className={`text-xs ${forgotMessage.includes("sent") || forgotMessage.includes("token") ? "text-green-300" : "text-red-300"}`}>
                    {forgotMessage}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                    {forgotLoading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">OTP</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter OTP from email"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-white/30">
                    Must include uppercase, lowercase, number and special character
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                {forgotMessage && (
                  <div className={`rounded-xl border px-3 py-2 text-xs ${
                    forgotMessage.includes("successfully") 
                      ? "border-green-500/20 bg-green-500/10 text-green-300" 
                      : forgotMessage.includes("sent") || forgotMessage.includes("OTP")
                      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                      : "border-red-500/20 bg-red-500/10 text-red-300"
                  }`}>
                    {forgotMessage}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setForgotStep("email")}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                    ← Back
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}