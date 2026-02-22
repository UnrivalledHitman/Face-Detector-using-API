const FaceRecognition = ({ imageUrl, boxes, isLoading }) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
      {/* Panel header */}
      <div className="w-full flex items-center gap-3 font-mono">
        <span className="text-yellow-400 text-[10px] uppercase tracking-[0.3em]">
          // Detection Output
        </span>
        <div className="flex-1 h-px bg-yellow-400/20" />
        {boxes.length > 0 && (
          <span className="text-yellow-400 text-[10px] uppercase tracking-widest">
            {boxes.length} face{boxes.length > 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Image container */}
      <div className="relative border border-yellow-400/30 bg-zinc-900/95 shadow-[0_0_40px_rgba(250,204,21,0.08)] p-1 flex justify-center">
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400 z-10" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400 z-10" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400 z-10" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400 z-10" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-yellow-400"
                  style={{
                    height: "20px",
                    animation: `scanBar 1s ease-in-out ${i * 0.15}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-yellow-400 text-[10px] uppercase tracking-[0.3em] animate-pulse">
              Scanning...
            </p>
          </div>
        )}

        {/* The image — inline-block makes the wrapper shrink-wrap to the image's exact rendered size */}
        <div className="relative inline-block">
          <img
            id="inputimage"
            src={imageUrl}
            alt="Detection input"
            className="block max-w-full max-h-[70vh] object-contain"
          />

          {/* Bounding boxes */}
          {boxes.map((box, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${box.topRow}%`,
                left: `${box.leftCol}%`,
                bottom: `${box.bottomRow}%`,
                right: `${box.rightCol}%`,
                border: "2px solid #facc15",
                boxShadow:
                  "0 0 10px rgba(250,204,21,0.5), inset 0 0 10px rgba(250,204,21,0.05)",
              }}
            >
              {/* Face label */}
              <span className="absolute -top-5 left-0 font-mono text-[9px] uppercase tracking-widest bg-yellow-400 text-black px-1.5 py-0.5 leading-none">
                face_{i + 1}
              </span>

              {/* Inner corner accents */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-200" />
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-yellow-200" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-yellow-200" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Scan line animation style */}
      <style>{`
        @keyframes scanBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default FaceRecognition;
