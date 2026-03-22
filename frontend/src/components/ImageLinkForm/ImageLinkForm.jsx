const ImageLinkForm = ({
  onInputChange,
  onFileChange,
  onButtonSubmit,
  isLoading,
  selectedFileName,
}) => {
  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      <p className="cyber-title text-yellow-200 text-xl md:text-2xl mb-8 text-center drop-shadow-lg font-bold uppercase tracking-[0.08em]">
        {"Insert image link or upload from your device !!!"}
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

        <label
          htmlFor="image-upload"
          className="w-full sm:w-auto py-4 px-4 bg-zinc-800 hover:bg-zinc-700 
                     text-yellow-100 font-semibold rounded-xl border border-zinc-600
                     inline-flex items-center justify-center text-center cursor-pointer transition-all shrink-0"
        >
          Upload Image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
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

      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-yellow-200/80 text-center">
        {selectedFileName
          ? `Selected: ${selectedFileName}`
          : "No local file selected"}
      </p>
    </div>
  );
};

export default ImageLinkForm;
