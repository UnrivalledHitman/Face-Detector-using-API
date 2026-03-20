import { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import ParticlesBg from "./components/ParticlesBG/ParticlesBg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";

const PAT = "dd7f7116b8684b2c9a82c19cdb29ae9e";
const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "face-detection";
const MODEL_VERSION_ID = "45fb9a671625463fa646c3523a3087d5";

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

  // Fetch rank from backend for the current user
  fetchRank = () => {
    const { user } = this.state;
    if (!user) return;

    fetch(`http://localhost:3000/rank/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ rank: data.rank, totalUsers: data.total });
      })
      .catch((err) => console.error("Failed to fetch rank:", err));
  };

  // Called by Navigation when user logs in or out
  onUserChange = (user) => {
    this.setState(
      {
        user,
        rank: null,
        totalUsers: null,
        // Clear these on logout
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

  // Update entries count in state after a successful detection
  onEntryUpdate = (updatedEntries) => {
    this.setState(
      (prev) => ({ user: { ...prev.user, entries: updatedEntries } }),
      () => this.fetchRank(), // Refresh rank after entries update
    );
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  calculateFaceBoxes = (regions) => {
    return regions.map((region) => {
      const { top_row, left_col, bottom_row, right_col } =
        region.region_info.bounding_box;
      return {
        topRow: top_row * 100,
        leftCol: left_col * 100,
        bottomRow: (1 - bottom_row) * 100,
        rightCol: (1 - right_col) * 100,
      };
    });
  };

  // Call /image to increment user's entry count
  incrementEntries = () => {
    const { user } = this.state;
    if (!user) return;

    fetch("http://localhost:3000/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.entries !== undefined) {
          this.onEntryUpdate(data.entries);
        }
      })
      .catch((err) => console.error("Failed to update entries:", err));
  };

  onButtonSubmit = () => {
    const { input } = this.state;
    if (!input) return;

    this.setState({ imageUrl: input, boxes: [], isLoading: true, error: "" });

    const raw = JSON.stringify({
      user_app_id: { user_id: USER_ID, app_id: APP_ID },
      inputs: [{ data: { image: { url: input } } }],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };

    fetch(
      `/clarifai-api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.outputs && result.outputs[0].data.regions) {
          const boxes = this.calculateFaceBoxes(result.outputs[0].data.regions);
          this.setState({ boxes, isLoading: false });
          this.incrementEntries();
        } else {
          this.setState({ isLoading: false, error: "No faces detected." });
        }
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          error: "API error. Check your URL or network.",
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
