const Rank = () => {
  return (
    <div className="flex items-center justify-center font-mono w-full px-4">
      {/* Horizontal Layout Container */}
      <div className="relative flex flex-row items-center justify-between gap-6 px-8 py-4 border border-yellow-400/30 bg-zinc-900/95 shadow-[0_0_40px_rgba(250,204,21,0.1)] transition-all duration-300">
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

        <div className="flex flex-col items-start border-r border-yellow-400/20 pr-6">
          <p className="text-white text-[10px] md:text-xs uppercase tracking-[0.2em]">
            Indrajeet, your rank is
          </p>
          <p className="text-white text-[9px] md:text-[10px] tracking-widest uppercase mt-0.5">
            Leaderboard Champion
          </p>
        </div>

        <div className="relative">
          {/* Sized to fit perfectly in a single row */}
          <span className="text-4xl md:text-5xl font-black leading-none text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            #1
          </span>
        </div>
      </div>
    </div>
  );
};

export default Rank;
