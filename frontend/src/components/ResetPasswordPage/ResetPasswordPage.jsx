import { useState } from "react";
import { BACKEND_URL } from "../../config";

const ResetPasswordPage = () => {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("");
        setError(typeof data === "string" ? data : "Unable to reset password.");
        return;
      }

      setError("");
      setStatus(
        typeof data === "string" ? data : "Password updated successfully.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch {
      setStatus("");
      setError("Could not reach the server. Is it running?");
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/95 border border-yellow-400/30 shadow-[0_0_60px_rgba(250,204,21,0.1)] p-8 font-mono">
      <div className="mb-6">
        <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
          // Secure Reset
        </p>
        <h2 className="text-white text-2xl font-black uppercase tracking-wider mt-1">
          Set New Password
        </h2>
        <div className="mt-2 h-px bg-yellow-400/20 w-full" />
      </div>

      {error && (
        <p className="mb-4 text-red-400 text-[10px] uppercase tracking-widest border border-red-400/30 px-3 py-2 bg-red-400/5">
          {error}
        </p>
      )}

      {status && (
        <p className="mb-4 text-green-400 text-[10px] uppercase tracking-widest border border-green-400/30 px-3 py-2 bg-green-400/5">
          {status}
        </p>
      )}

      <div className="mb-4">
        <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 focus:border-yellow-400/60 focus:outline-none transition-colors placeholder:text-zinc-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 focus:border-yellow-400/60 focus:outline-none transition-colors placeholder:text-zinc-600"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-black uppercase tracking-widest transition-all active:scale-95"
      >
        Reset Password
      </button>

      <button
        onClick={() => {
          window.history.replaceState({}, "", "/");
          window.location.assign("/");
        }}
        className="mt-3 w-full py-3 border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-sm font-black uppercase tracking-widest transition-all"
      >
        Back To App
      </button>
    </div>
  );
};

export default ResetPasswordPage;
