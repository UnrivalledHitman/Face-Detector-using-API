import { useState, useRef, useEffect } from "react";
import SignIn from "../SignIn/SignIn";
import SignOut from "../SignOut/SignOut";
import Register from "../Register/Register";

// Hardcoded user — swap with backend call later
const HARDCODED_USER = {
  email: "abcd1234@gmail.com",
  password: "abcd@1234",
  name: "abcd1234",
};

const Navigation = () => {
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = ({ email, password }) => {
    if (
      email === HARDCODED_USER.email &&
      password === HARDCODED_USER.password
    ) {
      setUser({ email: HARDCODED_USER.email, name: HARDCODED_USER.name });
      setAuthError("");
      setModal(null);
    } else {
      setAuthError("Invalid email or password.");
    }
  };

  const handleRegister = ({ email, password }) => {
    if (
      email === HARDCODED_USER.email &&
      password === HARDCODED_USER.password
    ) {
      setUser({ email: HARDCODED_USER.email, name: HARDCODED_USER.name });
      setAuthError("");
      setModal(null);
    } else {
      setAuthError("Registration is not available yet. Use the test account.");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setModal(null);
    setShowProfileMenu(false);
  };

  const closeModal = () => {
    setModal(null);
    setAuthError("");
  };

  // Get initials for avatar
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <nav className="flex justify-end items-center gap-3">
        {user ? (
          /* ── Signed in: show profile avatar ── */
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="relative w-11 h-11 flex items-center justify-center 
                         bg-zinc-900 border-2 border-yellow-400/60 hover:border-yellow-400 
                         font-mono font-black text-yellow-400 text-sm uppercase 
                         transition-all active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              {getInitials(user.name)}
              {/* Online dot */}
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-zinc-950 rounded-full" />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-zinc-900/98 border border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.1)] font-mono">
                {/* Corner accents */}
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
          /* ── Signed out: show Log In only ── */
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
    </>
  );
};

export default Navigation;
