import Tilt from "react-parallax-tilt";

const Logo = () => {
  return (
    <div className="relative z-50">
      <Tilt
        tiltMaxAngleX={20}
        tiltMaxAngleY={20}
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="#fbbf24"
        className="flex items-center justify-center w-24 h-24 border-2 border-yellow-400/40 bg-zinc-950/90 shadow-xl overflow-hidden cursor-pointer"
      >
        <div className="relative flex flex-col items-center">
          <img
            className="w-12 h-12 object-contain brightness-0 invert sepia(1) saturate(5) hue-rotate(10deg)"
            src="https://img.icons8.com/ios/50/brain--v1.png"
            alt="Brain logo"
          />
        </div>
        <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-400" />
      </Tilt>
    </div>
  );
};

export default Logo;
