import { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import ParticlesBg from "./components/ParticlesBG/ParticlesBg";

class App extends Component {
  render() {
    return (
      <div className="relative min-h-dvh bg-linear-to-r from-[#70b2ff] to-[#f571cd] flex flex-col overflow-hidden">
        {/* Particle Layer */}
        <ParticlesBg />

        {/* Header pushes Logo (Left) and Navigation (Right) to extreme corners */}
        <header className="relative z-20 w-full flex justify-between items-start p-4 md:p-10">
          <Logo />
          <Navigation />
        </header>

        {/* Main content is justify-start to pull it toward the top */}
        <main className="relative z-10 grow flex flex-col items-center justify-start w-full px-6 pt-4 md:pt-8 gap-10 md:gap-14">
          <Rank />

          <div className="w-full max-w-2xl">
            <ImageLinkForm />
          </div>

          {/* This container will hold your Face Recognition output */}
          <div className="w-full flex justify-center">
            {/* <FaceRecognition /> */}
          </div>
        </main>
      </div>
    );
  }
}

export default App;
