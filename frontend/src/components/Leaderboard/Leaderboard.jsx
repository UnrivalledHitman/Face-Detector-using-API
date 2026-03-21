const Leaderboard = ({ rows, loading, error }) => {
  return (
    <section className="w-full max-w-3xl border border-yellow-400/30 bg-zinc-900/95 font-mono shadow-[0_0_40px_rgba(250,204,21,0.1)]">
      <header className="px-5 py-4 border-b border-yellow-400/20 flex items-center justify-between">
        <h2 className="text-yellow-400 text-xs md:text-sm uppercase tracking-[0.25em]">
          Global Leaderboard
        </h2>
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest">
          Top {rows.length} Users
        </span>
      </header>

      {loading && (
        <p className="px-5 py-6 text-zinc-400 text-xs uppercase tracking-widest">
          Loading rankings...
        </p>
      )}

      {!loading && error && (
        <p className="px-5 py-6 text-red-400 text-xs uppercase tracking-widest border-t border-red-400/20">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="max-h-[55vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Rank
                </th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Username
                </th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-right">
                  Entries
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800/80 hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-5 py-3 text-yellow-400 text-xs">
                    #{row.rank}
                  </td>
                  <td className="px-5 py-3 text-zinc-100 text-sm uppercase tracking-wide">
                    {row.name}
                  </td>
                  <td className="px-5 py-3 text-right text-yellow-300 text-sm font-black">
                    {row.entries}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-zinc-500 text-xs uppercase tracking-widest"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Leaderboard;
