import { useState } from "react";

const Register = ({ onRegister, onClose, onGoSignIn, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !password || !confirm) {
      setLocalError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLocalError("");
    onRegister({ name, email, password });
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
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400" />

        <div className="mb-8">
          <div className="flex items-start justify-between mb-1">
            <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
              // New User
            </p>
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-yellow-400 transition-colors font-mono text-xs leading-none"
            >
              ✕
            </button>
          </div>
          <h2 className="text-white text-2xl font-black uppercase tracking-wider">
            Sign Up
          </h2>
          <div className="mt-2 h-px bg-yellow-400/20 w-full" />
        </div>

        {displayError && (
          <p className="mb-4 text-red-400 text-[10px] uppercase tracking-widest border border-red-400/30 px-3 py-2 bg-red-400/5">
            ⚠ {displayError}
          </p>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
            Username
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Choose a username"
            className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 
                       focus:border-yellow-400/60 focus:outline-none transition-colors 
                       placeholder:text-zinc-600"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@domain.com"
            className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 
                       focus:border-yellow-400/60 focus:outline-none transition-colors 
                       placeholder:text-zinc-600"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 
                       focus:border-yellow-400/60 focus:outline-none transition-colors 
                       placeholder:text-zinc-600"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-8">
          <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 
                       focus:border-yellow-400/60 focus:outline-none transition-colors 
                       placeholder:text-zinc-600"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm 
                     font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Create Account
        </button>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-zinc-600">
          Already have an account?{" "}
          <button
            onClick={onGoSignIn}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
