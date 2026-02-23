import { useState } from "react";

const SignIn = ({ onSignIn, onClose, onGoRegister, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgotSubmit = () => {
    if (!forgotEmail) return;
    setForgotSent(true);
  };

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

        {!showForgot ? (
          <>
            <div className="mb-8">
              <div className="flex items-start justify-between mb-1">
                <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
                  // Access Terminal
                </p>
                <button
                  onClick={onClose}
                  className="text-zinc-600 hover:text-yellow-400 transition-colors font-mono text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-wider">
                Log In
              </h2>
              <div className="mt-2 h-px bg-yellow-400/20 w-full" />
            </div>

            {error && (
              <p className="mb-4 text-red-400 text-[10px] uppercase tracking-widest border border-red-400/30 px-3 py-2 bg-red-400/5">
                ⚠ {error}
              </p>
            )}

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

            <div className="mb-2">
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

            <div className="flex justify-end mb-8">
              <button
                onClick={() => setShowForgot(true)}
                className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-yellow-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={() => onSignIn({ email, password })}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm 
                         font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Authenticate
            </button>

            <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-zinc-600">
              No account?{" "}
              <button
                onClick={onGoRegister}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-start justify-between mb-1">
                <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
                  // Password Recovery
                </p>
                <button
                  onClick={onClose}
                  className="text-zinc-600 hover:text-yellow-400 transition-colors font-mono text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-wider">
                Reset
              </h2>
              <div className="mt-2 h-px bg-yellow-400/20 w-full" />
            </div>

            {!forgotSent ? (
              <>
                <p className="text-zinc-400 text-xs tracking-wide mb-6 leading-relaxed">
                  Enter your email and we'll send you a reset link once the
                  backend is live.
                </p>
                <div className="mb-6">
                  <label className="block text-yellow-400 text-[10px] uppercase tracking-[0.2em] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full bg-zinc-800 text-gray-200 text-sm p-3 border border-zinc-700 
                               focus:border-yellow-400/60 focus:outline-none transition-colors 
                               placeholder:text-zinc-600"
                  />
                </div>
                <button
                  onClick={handleForgotSubmit}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm 
                             font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Send Reset Link
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <span className="text-yellow-400 text-3xl">✓</span>
                <p className="text-white text-xs uppercase tracking-widest text-center">
                  Reset link sent
                </p>
                <p className="text-zinc-500 text-[10px] text-center tracking-wide">
                  Check your inbox at {forgotEmail}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowForgot(false);
                setForgotSent(false);
                setForgotEmail("");
              }}
              className="mt-6 w-full text-center text-[10px] uppercase tracking-widest text-zinc-600 hover:text-yellow-400 transition-colors"
            >
              ← Back to Log In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;
