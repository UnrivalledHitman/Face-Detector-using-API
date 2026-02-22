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
    };
  }

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
    const { imageUrl, boxes, isLoading, error } = this.state;

    return (
      <div className="relative min-h-dvh bg-linear-to-r from-[#70b2ff] to-[#f571cd] flex flex-col overflow-hidden">
        {/* Particle Layer */}
        <ParticlesBg />

        {/* Header */}
        <header className="relative w-full flex justify-between items-start p-4 md:p-10">
          <Logo />
          <Navigation />
        </header>

        {/* Main content */}
        <main className="relative grow flex flex-col items-center justify-start w-full px-6 pt-4 md:pt-8 gap-10 md:gap-14">
          <Rank />

          <div className="w-full max-w-2xl">
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Status messages */}
          {error && (
            <p className="font-mono text-xs uppercase tracking-widest text-red-400 border border-red-400/30 px-4 py-2 bg-zinc-900/80">
              ⚠ {error}
            </p>
          )}

          {/* Face Recognition Output */}
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
