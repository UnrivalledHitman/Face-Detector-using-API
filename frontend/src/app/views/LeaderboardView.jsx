import Leaderboard from "../../components/Leaderboard/Leaderboard";

function LeaderboardView({
  leaderboard,
  leaderboardLoading,
  leaderboardError,
}) {
  return (
    <div className="w-full flex justify-center pb-16">
      <Leaderboard
        rows={leaderboard}
        loading={leaderboardLoading}
        error={leaderboardError}
      />
    </div>
  );
}

export default LeaderboardView;
