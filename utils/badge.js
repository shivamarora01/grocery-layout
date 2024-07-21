export const updateBadgeCount = (count) => {
  console.log("updateBadgeCount", count, navigator);
  if ("setAppBadge" in navigator) {
    navigator.setAppBadge(count).catch((error) => {
      console.error("Failed to set app badge:", error);
    });
  } else {
    console.warn("App badge API is not supported in this browser.");
  }
};

export const clearBadge = () => {
  if ("clearAppBadge" in navigator) {
    navigator.clearAppBadge().catch((error) => {
      console.error("Failed to clear app badge:", error);
    });
  }
};
