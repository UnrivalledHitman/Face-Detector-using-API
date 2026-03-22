export const realtimeEnabled =
  import.meta.env.VITE_ENABLE_REALTIME === "true" ||
  (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_REALTIME !== "false");

export const createInitialState = () => ({
  input: "",
  uploadedImageDataUrl: "",
  selectedFileName: "",
  imageUrl: "",
  boxes: [],
  isLoading: false,
  error: "",
  user: null,
  rank: null,
  totalUsers: null,
  activePage: "detector",
  leaderboard: [],
  leaderboardLoading: false,
  leaderboardError: "",
});

const toIdNumber = (value) => Number(value);

export const isSameId = (left, right) => toIdNumber(left) === toIdNumber(right);

export const withRanking = (rows) =>
  [...rows]
    .sort((a, b) => b.entries - a.entries)
    .map((row, index) => ({ ...row, rank: index + 1 }));

export const updateRowsForEntry = (rows, userId, entries) =>
  withRanking(
    rows.map((row) => (isSameId(row.id, userId) ? { ...row, entries } : row)),
  );

export const parseErrorMessage = (msg, fallback) =>
  typeof msg === "string" ? msg : fallback;

export const buildImageSubmission = ({
  input,
  uploadedImageDataUrl,
  userId,
}) => {
  const trimmedInput = input.trim();
  if (!trimmedInput && !uploadedImageDataUrl) return null;

  const payload = { id: userId ?? null };
  const nextImageUrl = trimmedInput || uploadedImageDataUrl;

  if (trimmedInput) {
    payload.url = trimmedInput;
  } else {
    payload.imageBase64 = uploadedImageDataUrl;
  }

  return { payload, nextImageUrl };
};
