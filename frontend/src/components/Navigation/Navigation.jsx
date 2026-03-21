import { useState, useRef, useEffect } from "react";
import SignIn from "../SignIn/SignIn";
import SignOut from "../SignOut/SignOut";
import Register from "../Register/Register";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { BACKEND_URL } from "../../config";

const Navigation = ({ user, onUserChange, activePage, onPageChange }) => {
  const [modal, setModal] = useState(null);
  const [authError, setAuthError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = async ({ username, password }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        setAuthError(typeof err === "string" ? err : "Invalid credentials.");
        return;
      }

      const loggedInUser = await response.json();
      onUserChange(loggedInUser);
      setAuthError("");
      setModal(null);
    } catch {
      setAuthError("Could not reach the server. Is it running?");
    }
  };

  const handleRegister = async ({ email, name, password }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        setAuthError(typeof err === "string" ? err : "Registration failed.");
        return;
      }

      const newUser = await response.json();
      onUserChange(newUser);
      setAuthError("");
      setModal(null);
    } catch {
      setAuthError("Could not reach the server. Is it running?");
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const response = await fetch(`${BACKEND_URL}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(
          typeof data === "string" ? data : "Unable to send reset email",
        );
        return "";
      }

      setAuthError("");
      return typeof data === "string"
        ? data
        : "If this email exists, a reset link has been sent.";
    } catch {
      setAuthError("Could not reach the server. Is it running?");
      return "";
    }
  };

  const handleSignOut = () => {
    onUserChange(null);
    setModal(null);
    setShowProfileMenu(false);
  };

  const closeModal = () => {
    setModal(null);
    setAuthError("");
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <nav className="flex justify-end items-center gap-3 flex-wrap">
        <button
          onClick={() => onPageChange("detector")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors ${
            activePage === "detector"
              ? "text-black bg-yellow-400 border-yellow-400"
              : "text-yellow-400 border-yellow-400/40 hover:border-yellow-400"
          }`}
        >
          Detector
        </button>
        <button
          onClick={() => onPageChange("leaderboard")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors ${
            activePage === "leaderboard"
              ? "text-black bg-yellow-400 border-yellow-400"
              : "text-yellow-400 border-yellow-400/40 hover:border-yellow-400"
          }`}
        >
          Leaderboard
        </button>

        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="relative w-11 h-11 flex items-center justify-center 
                         bg-zinc-900 border-2 border-yellow-400/60 hover:border-yellow-400 
                         font-mono font-black text-yellow-400 text-sm uppercase 
                         transition-all active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              {getInitials(user.name)}
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-zinc-950 rounded-full" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-zinc-900/98 border border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.1)] font-mono">
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-yellow-400 text-[10px] uppercase tracking-[0.2em]">
                    {user.name}
                  </p>
                  <p className="text-zinc-500 text-[9px] tracking-wide mt-0.5 truncate">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setModal("signout");
                  }}
                  className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest 
                             text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50 transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setModal("signin")}
            className="relative group px-6 py-2.5 font-mono text-sm uppercase tracking-widest 
                       text-yellow-400 bg-zinc-950 border border-yellow-400/40 
                       transition-all hover:bg-yellow-400 hover:text-black active:scale-95"
          >
            <span className="relative z-10">Log In</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </nav>

      {modal === "signin" && (
        <SignIn
          onClose={closeModal}
          onSignIn={handleSignIn}
          onForgotPassword={() => {
            setAuthError("");
            setModal("forgotpassword");
          }}
          onGoRegister={() => {
            setAuthError("");
            setModal("register");
          }}
          error={authError}
        />
      )}

      {modal === "register" && (
        <Register
          onClose={closeModal}
          onRegister={handleRegister}
          onGoSignIn={() => {
            setAuthError("");
            setModal("signin");
          }}
          error={authError}
        />
      )}

      {modal === "signout" && (
        <SignOut user={user} onClose={closeModal} onSignOut={handleSignOut} />
      )}

      {modal === "forgotpassword" && (
        <ForgotPassword
          onClose={closeModal}
          onSubmit={handleForgotPassword}
          error={authError}
        />
      )}
    </>
  );
};

export default Navigation;
