import { useState } from "react";

const ResetPassword = ({ onClose, onSubmit, token, error }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setLocalError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLocalError("");
    const msg = await onSubmit({ token, password });
    if (msg) {
      setStatus(msg);
      setPassword("");
      setConfirmPassword("");
    }
  };

  const displayError = localError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-zinc-900/95 border border-yellow-400/30 shadow-[0_0_60px_rgba(250,204,21,0.1)] p-8 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <div className="flex items-start justify-between mb-1">
            <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
              // Secure Reset
            </p>
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-yellow-400 transition-colors font-mono text-xs leading-none"
            >
              X
            </button>
          </div>
          <h2 className="text-white text-2xl font-black uppercase tracking-wider">
            Set New Password
          </h2>
          <div className="mt-2 h-px bg-yellow-400/20 w-full" />
        </div>

        {displayError && (
          <p className="mb-4 text-red-400 text-[10px] uppercase tracking-widest border border-red-400/30 px-3 py-2 bg-red-400/5">
            {displayError}
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
      </div>
    </div>
  );
};

export default ResetPassword;
