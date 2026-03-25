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

const getTinyFaceDetectorOptions = ({
  inputSize = 512,
  scoreThreshold = 0.5,
} = {}) =>
  new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold,
  });

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const toCandidateBox = (detection, width, height, passWeight = 1) => {
  const { x, y, width: boxWidth, height: boxHeight } = detection.box;
  const top = (y / height) * 100;
  const left = (x / width) * 100;
  const bottom = ((height - (y + boxHeight)) / height) * 100;
  const right = ((width - (x + boxWidth)) / width) * 100;
  const rawScore =
    typeof detection.score === "number" && Number.isFinite(detection.score)
      ? detection.score
      : 1;

  return {
    topRow: clampPercent(top),
    leftCol: clampPercent(left),
    bottomRow: clampPercent(bottom),
    rightCol: clampPercent(right),
    score: rawScore * passWeight,
  };
};

const toNormalizedCoords = (box) => {
  const x1 = box.leftCol / 100;
  const y1 = box.topRow / 100;
  const x2 = 1 - box.rightCol / 100;
  const y2 = 1 - box.bottomRow / 100;

  return {
    x1: Math.max(0, Math.min(1, x1)),
    y1: Math.max(0, Math.min(1, y1)),
    x2: Math.max(0, Math.min(1, x2)),
    y2: Math.max(0, Math.min(1, y2)),
  };
};

const isLikelyFaceBox = (box) => {
  const { x1, y1, x2, y2 } = toNormalizedCoords(box);
  const width = x2 - x1;
  const height = y2 - y1;

  if (width <= 0 || height <= 0) {
    return false;
  }

  const area = width * height;
  const aspectRatio = width / height;

  return (
    area >= 0.0005 && area <= 0.45 && aspectRatio >= 0.45 && aspectRatio <= 1.9
  );
};

const calculateIoU = (left, right) => {
  const a = toNormalizedCoords(left);
  const b = toNormalizedCoords(right);

  const interX1 = Math.max(a.x1, b.x1);
  const interY1 = Math.max(a.y1, b.y1);
  const interX2 = Math.min(a.x2, b.x2);
  const interY2 = Math.min(a.y2, b.y2);

  const interW = Math.max(0, interX2 - interX1);
  const interH = Math.max(0, interY2 - interY1);
  const interArea = interW * interH;

  const leftArea = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1);
  const rightArea = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1);
  const union = leftArea + rightArea - interArea;

  if (union <= 0) {
    return 0;
  }

  return interArea / union;
};

const applyNms = (boxes, iouThreshold = 0.35) => {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept = [];

  for (const candidate of sorted) {
    const overlaps = kept.some(
      (existing) => calculateIoU(existing, candidate) > iouThreshold,
    );
    if (!overlaps) {
      kept.push(candidate);
    }
  }

  return kept;
};

const dropScore = (box) => ({
  topRow: box.topRow,
  leftCol: box.leftCol,
  bottomRow: box.bottomRow,
  rightCol: box.rightCol,
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

const detectTinyFacesAsPercentBoxes = async ({
  input,
  width,
  height,
  options,
  passWeight = 1,
  minScore = 0,
}) => {
  const detections = await faceapi.detectAllFaces(
    input,
    getTinyFaceDetectorOptions(options),
  );

  return detections
    .map((detection) => toCandidateBox(detection, width, height, passWeight))
    .filter((box) => box.score >= minScore)
    .filter(isLikelyFaceBox);
};

const createUpscaledCanvas = (image, maxLongestSide = 1600) => {
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
  if (!largestSide || largestSide >= maxLongestSide) {
    return null;
  }

  const scale = maxLongestSide / largestSide;
  if (scale <= 1.05) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const FOCUSED_CROP_REGIONS = [
  { x: 0.1, y: 0.08, w: 0.8, h: 0.74 },
  { x: 0.12, y: 0.2, w: 0.76, h: 0.72 },
  { x: 0, y: 0.12, w: 0.62, h: 0.76 },
  { x: 0.38, y: 0.12, w: 0.62, h: 0.76 },
  { x: 0, y: 0.18, w: 1, h: 0.68 },
];

const createFocusedCropCanvas = (image, region, targetLongestSide = 1400) => {
  const sourceX = Math.max(0, Math.round(region.x * image.naturalWidth));
  const sourceY = Math.max(0, Math.round(region.y * image.naturalHeight));
  const sourceW = Math.max(1, Math.round(region.w * image.naturalWidth));
  const sourceH = Math.max(1, Math.round(region.h * image.naturalHeight));

  if (sourceW < 32 || sourceH < 32) {
    return null;
  }

  const scale = Math.max(1, targetLongestSide / Math.max(sourceW, sourceH));
  const drawW = Math.max(1, Math.round(sourceW * Math.min(scale, 2.5)));
  const drawH = Math.max(1, Math.round(sourceH * Math.min(scale, 2.5)));

  const canvas = document.createElement("canvas");
  canvas.width = drawW;
  canvas.height = drawH;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, drawW, drawH);

  return {
    canvas,
    normalizedRegion: {
      x: sourceX / image.naturalWidth,
      y: sourceY / image.naturalHeight,
      w: sourceW / image.naturalWidth,
      h: sourceH / image.naturalHeight,
    },
  };
};

const remapCropBoxToImage = (box, normalizedRegion) => {
  const local = toNormalizedCoords(box);

  const globalX1 = normalizedRegion.x + local.x1 * normalizedRegion.w;
  const globalY1 = normalizedRegion.y + local.y1 * normalizedRegion.h;
  const globalX2 = normalizedRegion.x + local.x2 * normalizedRegion.w;
  const globalY2 = normalizedRegion.y + local.y2 * normalizedRegion.h;

  return {
    topRow: clampPercent(globalY1 * 100),
    leftCol: clampPercent(globalX1 * 100),
    bottomRow: clampPercent((1 - globalY2) * 100),
    rightCol: clampPercent((1 - globalX2) * 100),
    score: box.score,
  };
};

const detectFacesOnFocusedCrops = async (image) => {
  const allBoxes = [];

  for (const region of FOCUSED_CROP_REGIONS) {
    const crop = createFocusedCropCanvas(image, region);
    if (!crop) {
      continue;
    }

    const cropBoxes = await detectTinyFacesAsPercentBoxes({
      input: crop.canvas,
      width: crop.canvas.width,
      height: crop.canvas.height,
      options: { inputSize: 608, scoreThreshold: 0.28 },
      passWeight: 0.82,
      minScore: 0.26,
    });

    allBoxes.push(
      ...cropBoxes.map((box) =>
        remapCropBoxToImage(box, crop.normalizedRegion),
      ),
    );
  }

  return allBoxes;
};

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

  const primaryPassBoxes = await detectTinyFacesAsPercentBoxes({
    input: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    options: { inputSize: 512, scoreThreshold: 0.5 },
    passWeight: 1,
    minScore: 0.45,
  });

  const lowThresholdBoxes = await detectTinyFacesAsPercentBoxes({
    input: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    options: { inputSize: 608, scoreThreshold: 0.35 },
    passWeight: 0.92,
    minScore: 0.35,
  });

  let mergedBoxes = applyNms([...primaryPassBoxes, ...lowThresholdBoxes]);
  if (mergedBoxes.length >= 2) {
    return mergedBoxes.map(dropScore);
  }

  // Upscaled retry improves recall for small/far faces in wide scene photos.
  const upscaledCanvas = createUpscaledCanvas(image);
  if (!upscaledCanvas) {
    return mergedBoxes.map(dropScore);
  }

  const upscaledBoxes = await detectTinyFacesAsPercentBoxes({
    input: upscaledCanvas,
    width: upscaledCanvas.width,
    height: upscaledCanvas.height,
    options: { inputSize: 608, scoreThreshold: 0.3 },
    passWeight: 0.85,
    minScore: 0.3,
  });

  mergedBoxes = applyNms([...mergedBoxes, ...upscaledBoxes]);

  if (mergedBoxes.length < 2) {
    const focusedCropBoxes = await detectFacesOnFocusedCrops(image);
    mergedBoxes = applyNms([...mergedBoxes, ...focusedCropBoxes], 0.33);
  }

  return mergedBoxes.map(dropScore);
};
