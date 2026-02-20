const ImageLinkForm = ({ onInputChange, onButtonSubmit }) => {
  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      <p className="text-black text-xl md:text-2xl mb-8 text-center drop-shadow-lg font-bold">
        {"Insert your image link here and detect faces in it !!!"}
      </p>

      <div
        className="flex flex-col sm:flex-row items-stretch w-full max-w-175 
                      bg-[#121826]/90 backdrop-blur-sm p-2 sm:p-4 
                      rounded-2xl border-2 border-orange-600 shadow-2xl gap-3"
      >
        <input
          type="text"
          placeholder="Paste image URL..."
          className="grow bg-[#1F2937] text-gray-200 p-4 rounded-xl 
                     outline-none border border-gray-700 focus:border-orange-500 
                     transition-all text-base md:text-lg min-w-0"
          onChange={onInputChange}
        />

        <button
          className="w-full sm:w-32 py-4 bg-orange-600 hover:bg-orange-500 
                     text-white font-bold rounded-xl shadow-lg 
                     transform active:scale-95 transition-all cursor-pointer 
                     shrink-0"
          onClick={onButtonSubmit}
        >
          Detect
        </button>
      </div>
    </div>
  );
};

export default ImageLinkForm;
