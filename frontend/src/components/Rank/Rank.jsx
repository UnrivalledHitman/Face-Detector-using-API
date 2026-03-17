const Rank = ({ user, rank, totalUsers }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center font-mono w-full px-4">
        <div className="relative flex flex-row items-center justify-center px-8 py-4 border border-yellow-400/20 bg-zinc-900/80">
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/40" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/40" />
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
            Log in to track your detections
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center font-mono w-full px-4">
      <div className="relative flex flex-row items-center justify-between gap-6 px-8 py-4 border border-yellow-400/30 bg-zinc-900/95 shadow-[0_0_40px_rgba(250,204,21,0.1)] transition-all duration-300">
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

        {/* Left — name, rank position */}
        <div className="flex flex-col items-start border-r border-yellow-400/20 pr-6">
          <p className="text-white text-[10px] md:text-xs uppercase tracking-[0.2em]">
            {user.name}, your detections
          </p>
          <p className="text-zinc-500 text-[9px] md:text-[10px] tracking-widest uppercase mt-0.5">
            {rank !== null && totalUsers !== null
              ? `Rank #${rank} of ${totalUsers} user${totalUsers !== 1 ? "s" : ""}`
              : "Calculating rank..."}
          </p>
        </div>

        {/* Right — entry count */}
        <div className="relative">
          <span className="text-4xl md:text-5xl font-black leading-none text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            {user.entries}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Rank;
