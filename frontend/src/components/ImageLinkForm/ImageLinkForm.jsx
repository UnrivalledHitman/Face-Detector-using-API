const ImageLinkForm = ({ onInputChange, onButtonSubmit, isLoading }) => {
  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      <p className="cyber-title text-yellow-200 text-xl md:text-2xl mb-8 text-center drop-shadow-lg font-bold uppercase tracking-[0.08em]">
        {"Insert your image link here and detect faces in it !!!"}
      </p>

      <div
        className="flex flex-col sm:flex-row items-stretch w-full max-w-175 
                      bg-zinc-950/90 backdrop-blur-sm p-2 sm:p-4 
                      rounded-2xl border-2 border-yellow-400/45 shadow-[0_0_35px_rgba(250,204,21,0.14)] gap-3"
      >
        <input
          type="text"
          placeholder="Paste image URL..."
          className="grow bg-zinc-900 text-yellow-50 p-4 rounded-xl 
                     outline-none border border-zinc-700 focus:border-yellow-400/70 
                     transition-all text-base md:text-lg min-w-0"
          onChange={onInputChange}
        />

        <button
          className="w-full sm:w-32 py-4 bg-yellow-400 hover:bg-yellow-300 
                     disabled:bg-yellow-700/50 disabled:cursor-not-allowed
                     text-black font-bold rounded-xl shadow-lg 
                     transform active:scale-95 transition-all cursor-pointer 
                     shrink-0"
          onClick={onButtonSubmit}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Detect"}
        </button>
      </div>
    </div>
  );
};

export default ImageLinkForm;
