import { BACKEND_URL } from "../../config";

const parseApiResponse = async (response) => {
  if (!response.ok) {
    try {
      throw await response.json();
    } catch {
      throw null;
    }
  }

  return response.json();
};

export const fetchRankByUserId = (userId) =>
  fetch(`${BACKEND_URL}/rank/${userId}`).then(parseApiResponse);

export const fetchLeaderboardRows = (limit = 10) =>
  fetch(`${BACKEND_URL}/rank/leaderboard?limit=${limit}`).then(
    parseApiResponse,
  );

export const submitImageEntry = (payload) =>
  fetch(`${BACKEND_URL}/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(parseApiResponse);

export const fetchImageDataUrlFromProxy = (url) =>
  fetch(`${BACKEND_URL}/imageproxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).then(parseApiResponse);
