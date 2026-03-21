import { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import ParticlesBg from "./components/ParticlesBG/ParticlesBg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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
    };
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

  onUserChange = (user) => {
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
        if (user) this.fetchRank();
      },
    );
  };

  onEntryUpdate = (updatedEntries) => {
    this.setState(
      (prev) => ({ user: { ...prev.user, entries: updatedEntries } }),
      () => this.fetchRank(),
    );
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
    const { imageUrl, boxes, isLoading, error, user, rank, totalUsers } =
      this.state;

    return (
      <div className="relative min-h-dvh bg-linear-to-r from-[#70b2ff] to-[#f571cd] flex flex-col overflow-hidden">
        <ParticlesBg />

        <header className="relative w-full flex justify-between items-start p-4 md:p-10">
          <Logo />
          <Navigation onUserChange={this.onUserChange} />
        </header>

        <main className="relative grow flex flex-col items-center justify-start w-full px-6 pt-4 md:pt-8 gap-10 md:gap-14">
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
        </main>
      </div>
    );
  }
}

export default App;
