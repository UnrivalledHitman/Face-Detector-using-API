import { Component } from "react";
import { io } from "socket.io-client";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import ParticlesBg from "./components/ParticlesBg/ParticlesBg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import ResetPasswordPage from "./components/ResetPasswordPage/ResetPasswordPage";
import { BACKEND_URL, WS_URL } from "./config";

const realtimeEnabled =
  import.meta.env.VITE_ENABLE_REALTIME === "true" ||
  (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_REALTIME !== "false");

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      boxes: [],
      isLoading: false,
      error: "",
      user: null,
      rank: null,
      totalUsers: null,
      activePage: "detector",
      leaderboard: [],
      leaderboardLoading: false,
      leaderboardError: "",
    };
    this.socket = null;
  }

  componentDidMount() {
    // Restore user from localStorage if available
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        this.setState({ user: JSON.parse(savedUser) }, () => {
          this.fetchRank();
        });
      } catch (e) {
        console.error("Failed to restore user from localStorage", e);
        localStorage.removeItem("user");
      }
    }

    this.fetchLeaderboard();
    if (realtimeEnabled) {
      this.socket = io(WS_URL);
      this.socket.on("entryUpdated", ({ userId, entries }) => {
        this.setState(
          (prev) => {
            const updatedUser =
              prev.user && Number(prev.user.id) === Number(userId)
                ? { ...prev.user, entries }
                : prev.user;

            const leaderboard = prev.leaderboard
              .map((row) =>
                Number(row.id) === Number(userId) ? { ...row, entries } : row,
              )
              .sort((a, b) => b.entries - a.entries)
              .map((row, index) => ({ ...row, rank: index + 1 }));

            return { user: updatedUser, leaderboard };
          },
          () => {
            if (
              this.state.user &&
              Number(this.state.user.id) === Number(userId)
            ) {
              this.fetchRank();
            }
          },
        );
      });
    }
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  fetchRank = () => {
    const { user } = this.state;
    if (!user) return;

    fetch(`${BACKEND_URL}/rank/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ rank: data.rank, totalUsers: data.total });
      })
      .catch((err) => console.error("Failed to fetch rank:", err));
  };

  fetchLeaderboard = () => {
    this.setState({ leaderboardLoading: true, leaderboardError: "" });
    fetch(`${BACKEND_URL}/rank/leaderboard?limit=100`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((msg) => Promise.reject(msg));
        }
        return res.json();
      })
      .then((rows) => {
        this.setState({ leaderboard: rows, leaderboardLoading: false });
      })
      .catch((msg) => {
        this.setState({
          leaderboardLoading: false,
          leaderboardError:
            typeof msg === "string"
              ? msg
              : "Could not load leaderboard right now.",
        });
      });
  };

  onUserChange = (user) => {
    // Save or clear user in localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    this.setState(
      {
        user,
        rank: null,
        totalUsers: null,
        imageUrl: "",
        boxes: [],
        error: "",
        input: "",
      },
      () => {
        if (user) {
          this.fetchRank();
        }
        this.fetchLeaderboard();
      },
    );
  };

  onEntryUpdate = (updatedEntries) => {
    this.setState(
      (prev) => {
        const leaderboard = prev.leaderboard
          .map((row) =>
            prev.user && row.id === prev.user.id
              ? { ...row, entries: updatedEntries }
              : row,
          )
          .sort((a, b) => b.entries - a.entries)
          .map((row, index) => ({ ...row, rank: index + 1 }));

        return {
          user: prev.user ? { ...prev.user, entries: updatedEntries } : null,
          leaderboard,
        };
      },
      () => {
        this.fetchRank();
      },
    );
  };

  onPageChange = (activePage) => {
    this.setState({ activePage }, () => {
      if (activePage === "leaderboard") {
        this.fetchLeaderboard();
      }
    });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    const { input, user } = this.state;
    if (!input) return;

    this.setState({ imageUrl: input, boxes: [], isLoading: true, error: "" });

    // Single request to backend — Clarifai call + entry increment happen server-side
    fetch(`${BACKEND_URL}/imageurl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: input,
        id: user ? user.id : null, // Send user id if logged in
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((msg) => Promise.reject(msg));
        return res.json();
      })
      .then(({ boxes, entries }) => {
        this.setState({ boxes, isLoading: false });
        // Update entry count if user is logged in
        if (entries !== null) this.onEntryUpdate(entries);
      })
      .catch((msg) => {
        this.setState({
          isLoading: false,
          error:
            typeof msg === "string"
              ? msg
              : "API error. Check your URL or network.",
        });
      });
  };

  render() {
    if (window.location.pathname === "/reset-password") {
      return (
        <div className="cyber-app-shell relative min-h-dvh flex flex-col overflow-hidden">
          <ParticlesBg />
          <main className="relative grow flex items-center justify-center w-full px-6 py-10">
            <ResetPasswordPage />
          </main>
        </div>
      );
    }

    const {
      imageUrl,
      boxes,
      isLoading,
      error,
      user,
      rank,
      totalUsers,
      activePage,
      leaderboard,
      leaderboardLoading,
      leaderboardError,
    } = this.state;

    return (
      <div className="cyber-app-shell relative min-h-dvh flex flex-col overflow-hidden">
        <ParticlesBg />

        <header className="relative w-full flex justify-between items-start p-4 md:p-10">
          <Logo />
          <Navigation
            user={user}
            onUserChange={this.onUserChange}
            activePage={activePage}
            onPageChange={this.onPageChange}
          />
        </header>

        <main className="relative grow flex flex-col items-center justify-start w-full px-6 pt-4 md:pt-8 gap-10 md:gap-14">
          {activePage === "detector" ? (
            <>
              <Rank user={user} rank={rank} totalUsers={totalUsers} />

              <div className="w-full max-w-2xl">
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                  isLoading={isLoading}
                />
              </div>

              {error && (
                <p className="font-mono text-xs uppercase tracking-widest text-red-400 border border-red-400/30 px-4 py-2 bg-zinc-900/80">
                  ⚠ {error}
                </p>
              )}

              <div className="w-full flex justify-center pb-16">
                {imageUrl && (
                  <FaceRecognition
                    imageUrl={imageUrl}
                    boxes={boxes}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center pb-16">
              <Leaderboard
                rows={leaderboard}
                loading={leaderboardLoading}
                error={leaderboardError}
              />
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default App;
