import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ParticlesBg from "./components/ParticlesBg/ParticlesBg";
import DetectorView from "./app/views/DetectorView";
import LeaderboardView from "./app/views/LeaderboardView";
import ResetPasswordScreen from "./app/views/ResetPasswordScreen";
import { realtimeEnabled } from "./app/helpers";
import { createRealtimeConnection } from "./app/services/realtime";
import useAppStore from "./app/store/useAppStore";

function App() {
  const {
    user,
    rank,
    totalUsers,
    isLoading,
    selectedFileName,
    error,
    imageUrl,
    boxes,
    activePage,
    leaderboard,
    leaderboardLoading,
    leaderboardError,
    restoreUserFromStorage,
    fetchLeaderboard,
    applyRealtimeEntryUpdate,
    clearAsyncWork,
    onUserChange,
    onPageChange,
    onInputChange,
    onFileSelect,
  } = useAppStore(
    useShallow((state) => ({
      user: state.user,
      rank: state.rank,
      totalUsers: state.totalUsers,
      isLoading: state.isLoading,
      selectedFileName: state.selectedFileName,
      error: state.error,
      imageUrl: state.imageUrl,
      boxes: state.boxes,
      activePage: state.activePage,
      leaderboard: state.leaderboard,
      leaderboardLoading: state.leaderboardLoading,
      leaderboardError: state.leaderboardError,
      restoreUserFromStorage: state.restoreUserFromStorage,
      fetchLeaderboard: state.fetchLeaderboard,
      applyRealtimeEntryUpdate: state.applyRealtimeEntryUpdate,
      clearAsyncWork: state.clearAsyncWork,
      onUserChange: state.onUserChange,
      onPageChange: state.onPageChange,
      onInputChange: state.onInputChange,
      onFileSelect: state.onFileSelect,
    })),
  );

  useEffect(() => {
    restoreUserFromStorage();
    fetchLeaderboard();

    if (!realtimeEnabled) {
      return () => {
        clearAsyncWork();
      };
    }

    const socket = createRealtimeConnection({
      onEntryUpdated: ({ userId, entries }) => {
        applyRealtimeEntryUpdate(userId, entries);
      },
    });

    return () => {
      socket.disconnect();
      clearAsyncWork();
    };
  }, [
    applyRealtimeEntryUpdate,
    clearAsyncWork,
    fetchLeaderboard,
    restoreUserFromStorage,
  ]);

  const handleInputChange = (event) => {
    onInputChange(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onFileSelect(file);
    event.target.value = "";
  };

  if (window.location.pathname === "/reset-password") {
    return <ResetPasswordScreen />;
  }

  return (
    <div className="cyber-app-shell relative min-h-dvh flex flex-col overflow-hidden">
      <ParticlesBg />

      <header className="relative w-full flex justify-between items-start p-4 md:p-10">
        <Logo />
        <Navigation
          user={user}
          onUserChange={onUserChange}
          activePage={activePage}
          onPageChange={onPageChange}
        />
      </header>

      <main className="relative grow flex flex-col items-center justify-start w-full px-6 pt-4 md:pt-8 gap-10 md:gap-14">
        {activePage === "detector" ? (
          <DetectorView
            user={user}
            rank={rank}
            totalUsers={totalUsers}
            isLoading={isLoading}
            selectedFileName={selectedFileName}
            error={error}
            imageUrl={imageUrl}
            boxes={boxes}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
          />
        ) : (
          <LeaderboardView
            leaderboard={leaderboard}
            leaderboardLoading={leaderboardLoading}
            leaderboardError={leaderboardError}
          />
        )}
      </main>
    </div>
  );
}

export default App;
