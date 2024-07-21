const STORAGE_KEY = "pwaModalShown";
const LOCATION_MODAL_KEY = "locationModalShown";

export const storage = {
  setPwaModalShown() {
    sessionStorage.setItem(STORAGE_KEY, "true");
  },
  isPwaModalShown() {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  },
  resetPwaModalShown() {
    sessionStorage.removeItem(STORAGE_KEY);
  },
  setLocationModalShown() {
    sessionStorage.setItem(LOCATION_MODAL_KEY, "true");
  },
  isLocationModalShown() {
    return sessionStorage.getItem(LOCATION_MODAL_KEY) === "true";
  },
  resetLocationModalShown() {
    sessionStorage.removeItem(LOCATION_MODAL_KEY);
  },
};
