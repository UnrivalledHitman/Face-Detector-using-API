import Rank from "../../components/Rank/Rank";
import ImageLinkForm from "../../components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "../../components/FaceRecognition/FaceRecognition";

function DetectorView({
  user,
  rank,
  totalUsers,
  input,
  isLoading,
  selectedFileName,
  error,
  imageUrl,
  boxes,
  onInputChange,
  onFileChange,
}) {
  return (
    <>
      <Rank user={user} rank={rank} totalUsers={totalUsers} />

      <div className="w-full max-w-2xl">
        <ImageLinkForm
          inputValue={input}
          onInputChange={onInputChange}
          onFileChange={onFileChange}
          isLoading={isLoading}
          selectedFileName={selectedFileName}
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
  );
}

export default DetectorView;
