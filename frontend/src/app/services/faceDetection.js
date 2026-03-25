import * as faceapi from "face-api.js";
import { FACE_API_MODEL_URL } from "../../config";
import { fetchImageDataUrlFromProxy } from "./api";

let modelsReadyPromise = null;

const DEFAULT_MODEL_URL_FALLBACKS = [
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
  "https://justadudewhohacks.github.io/face-api.js/models",
];

const getModelUrlCandidates = () => {
  const seen = new Set();
  return [FACE_API_MODEL_URL, ...DEFAULT_MODEL_URL_FALLBACKS].filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
};

const getTinyFaceDetectorOptions = () =>
  new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,
    scoreThreshold: 0.5,
  });

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const toPercentBoxes = (detections, width, height) =>
  detections.map((detection) => {
    const { x, y, width: boxWidth, height: boxHeight } = detection.box;
    const top = (y / height) * 100;
    const left = (x / width) * 100;
    const bottom = ((height - (y + boxHeight)) / height) * 100;
    const right = ((width - (x + boxWidth)) / width) * 100;

    return {
      topRow: clampPercent(top),
      leftCol: clampPercent(left),
      bottomRow: clampPercent(bottom),
      rightCol: clampPercent(right),
    };
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("The image could not be loaded for detection."));
        return;
      }
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("Could not load this image in the browser."));
    };

    image.src = src;
  });

export const warmUpFaceApi = () => {
  if (!modelsReadyPromise) {
    modelsReadyPromise = (async () => {
      let lastError = null;

      for (const modelUrl of getModelUrlCandidates()) {
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
          return;
        } catch (err) {
          lastError = err;
        }
      }

      throw new Error(
        "Face detection model files could not be loaded. Add TinyFaceDetector files to /public/models or set VITE_FACE_API_MODEL_URL.",
        { cause: lastError },
      );
    })().catch((err) => {
      modelsReadyPromise = null;
      throw err;
    });
  }

  return modelsReadyPromise;
};

export const detectFacesInImage = async (imageSrc) => {
  await warmUpFaceApi();

  let image;
  try {
    image = await loadImage(imageSrc);
  } catch (err) {
    const isRemoteUrl = /^https?:\/\//i.test(String(imageSrc || ""));
    if (!isRemoteUrl) {
      throw err;
    }

    const { dataUrl } = await fetchImageDataUrlFromProxy(imageSrc);
    image = await loadImage(dataUrl);
  }

  const detections = await faceapi.detectAllFaces(
    image,
    getTinyFaceDetectorOptions(),
  );

  return toPercentBoxes(detections, image.naturalWidth, image.naturalHeight);
};
