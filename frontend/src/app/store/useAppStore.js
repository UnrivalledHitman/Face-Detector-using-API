import { create } from "zustand";
import {
  buildImageSubmission,
  createInitialState,
  isSameId,
  parseErrorMessage,
  updateRowsForEntry,
} from "../helpers";
import {
  fetchLeaderboardRows,
  fetchRankByUserId,
  submitImageForDetection,
} from "../services/api";

let lastLeaderboardFetchAt = 0;
let rankRefreshTimer = null;

const clearRankRefreshTimerInternal = () => {
  if (!rankRefreshTimer) return;
  clearTimeout(rankRefreshTimer);
  rankRefreshTimer = null;
};

const scheduleRankRefreshInternal = (delay, get) => {
  clearRankRefreshTimerInternal();
  rankRefreshTimer = setTimeout(() => {
    rankRefreshTimer = null;
    get().fetchRank();
  }, delay);
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read the selected image."));
        return;
      }
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected image."));
    };

    reader.readAsDataURL(file);
  });

const useAppStore = create((set, get) => ({
  ...createInitialState(),

  restoreUserFromStorage: () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);
      set({ user: parsedUser });
      get().fetchRank();
    } catch (err) {
      console.error("Failed to restore user from localStorage", err);
      localStorage.removeItem("user");
    }
  },

  fetchRank: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const data = await fetchRankByUserId(user.id);
      set({ rank: data.rank, totalUsers: data.total });
    } catch (err) {
      console.error("Failed to fetch rank:", err);
    }
  },

  fetchLeaderboard: async ({ force = false } = {}) => {
    const { leaderboard, leaderboardLoading } = get();
    const now = Date.now();

    if (leaderboardLoading) return;
    if (
      !force &&
      leaderboard.length > 0 &&
      now - lastLeaderboardFetchAt < 10000
    ) {
      return;
    }

    set({ leaderboardLoading: true, leaderboardError: "" });
    try {
      const rows = await fetchLeaderboardRows(100);
      lastLeaderboardFetchAt = Date.now();
      set({ leaderboard: rows, leaderboardLoading: false });
    } catch (msg) {
      set({
        leaderboardLoading: false,
        leaderboardError: parseErrorMessage(
          msg,
          "Could not load leaderboard right now.",
        ),
      });
    }
  },

  onUserChange: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    const { activePage } = get();
    set({
      ...createInitialState(),
      activePage,
      user,
    });

    if (user) {
      get().fetchRank();
    }
    get().fetchLeaderboard();
  },

  onEntryUpdate: (updatedEntries, { refreshDelay = 200 } = {}) => {
    set((prev) => {
      const userId = prev.user?.id;
      const leaderboard = userId
        ? updateRowsForEntry(prev.leaderboard, userId, updatedEntries)
        : prev.leaderboard;

      return {
        user: prev.user ? { ...prev.user, entries: updatedEntries } : null,
        leaderboard,
      };
    });

    scheduleRankRefreshInternal(refreshDelay, get);
  },

  applyRealtimeEntryUpdate: (userId, entries) => {
    const shouldRefreshRank = get().user && isSameId(get().user.id, userId);

    set((prev) => ({
      user:
        prev.user && isSameId(prev.user.id, userId)
          ? { ...prev.user, entries }
          : prev.user,
      leaderboard: updateRowsForEntry(prev.leaderboard, userId, entries),
    }));

    if (shouldRefreshRank) {
      scheduleRankRefreshInternal(150, get);
    }
  },

  onPageChange: (activePage) => {
    set({ activePage });
    if (activePage === "leaderboard") {
      get().fetchLeaderboard();
    }
  },

  onInputChange: (nextInput) => {
    set({
      input: nextInput,
      uploadedImageDataUrl: "",
      selectedFileName: "",
    });
  },

  onFileSelect: async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      set({ error: "Please upload a valid image file." });
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      set({ error: "Please upload an image smaller than 5MB." });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      set({
        uploadedImageDataUrl: dataUrl,
        selectedFileName: file.name,
        input: "",
        imageUrl: dataUrl,
        boxes: [],
        error: "",
      });
    } catch {
      set({ error: "Could not read the selected image." });
    }
  },

  onButtonSubmit: async () => {
    const { input, uploadedImageDataUrl, user } = get();
    const submission = buildImageSubmission({
      input,
      uploadedImageDataUrl,
      userId: user?.id,
    });
    if (!submission) return;

    const { payload, nextImageUrl } = submission;

    set({
      imageUrl: nextImageUrl,
      boxes: [],
      isLoading: true,
      error: "",
    });

    try {
      const { boxes, entries } = await submitImageForDetection(payload);
      set({ boxes, isLoading: false });
      if (entries !== null) {
        get().onEntryUpdate(entries);
      }
    } catch (msg) {
      set({
        isLoading: false,
        error: parseErrorMessage(msg, "API error. Check your URL or network."),
      });
    }
  },

  clearAsyncWork: () => {
    clearRankRefreshTimerInternal();
  },
}));

export default useAppStore;
