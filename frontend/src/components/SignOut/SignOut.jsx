const SignOut = ({ user, onSignOut, onClose }) => {
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
              // Session
            </p>
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-yellow-400 transition-colors font-mono text-xs leading-none"
            >
              ✕
            </button>
          </div>
          <h2 className="text-white text-2xl font-black uppercase tracking-wider">
            Sign Out
          </h2>
          <div className="mt-2 h-px bg-yellow-400/20 w-full" />
        </div>

        <div className="mb-8 flex flex-col gap-1">
          <p className="text-zinc-400 text-xs tracking-wide leading-relaxed">
            Signed in as
          </p>
          <p className="text-yellow-400 text-sm tracking-widest">
            {user?.email}
          </p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-3">
            Are you sure you want to end your session?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-zinc-700 hover:border-yellow-400/40 
                       text-zinc-400 hover:text-yellow-400 text-sm font-black uppercase 
                       tracking-widest transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onSignOut}
            className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm 
                       font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
