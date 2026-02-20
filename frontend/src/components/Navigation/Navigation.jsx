const Navigation = () => {
  return (
    <nav className="flex justify-end">
      <button
        className="relative group px-6 py-2.5 font-mono text-sm uppercase tracking-widest 
                   text-yellow-400 bg-zinc-950 border border-yellow-400/40 
                   transition-all hover:bg-yellow-400 hover:text-black active:scale-95"
      >
        <span className="relative z-10">Sign In</span>
        {/* Cyber-accent on hover */}
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </nav>
  );
};

export default Navigation;
