import { api_url } from "@/constants/Links";
const registerServiceWorker = () => {
  return navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => {
      console.log(
        "serviceWorker Service Worker registered with scope:",
        registration.scope
      );
      return registration;
    })
    .catch((error) => {
      console.error("serviceWorker Service Worker registration failed:", error);
      throw error;
    });
};

const getApplicationServerKey = () => {
  const base64String =
    "BJ1mEiH121HyrWQU37pqh8U8KUix_3U_ZaiPeijVVQ00sYiNuNGddpXUssFbDWAD0glKe3t6_5ZP4cu-vYQYlAA";
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const subscribePushManager = async (registration) => {
  const applicationServerKey = getApplicationServerKey();

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    const currentKey = existingSubscription.options.applicationServerKey;
    if (currentKey && !arraysEqual(currentKey, applicationServerKey)) {
      await existingSubscription.unsubscribe();
      console.log("Unsubscribed from existing push subscription");
    }
  }

  return registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
    .then((subscription) => {
      console.log("serviceWorker Push Manager subscribed:", subscription);
      return subscription;
    })
    .catch((error) => {
      console.error("serviceWorker Push Manager subscription failed:", error);
      throw error;
    });
};

const sendSubscriptionToServer = (subscription) => {
  const storedSellerDetails = localStorage.getItem("SellerDetails");
  const BuyerId = localStorage.getItem("BuyerId");
  const sellerDetails = JSON.parse(storedSellerDetails);
  console.log("serviceWorker payload:", {
    subscription: subscription,
    workspace: sellerDetails?._id,
    customerId: BuyerId,
  });
  return fetch(`${api_url}/webpush/subscribe`, {
    method: "POST",
    body: JSON.stringify({
      subscription: subscription,
      workspace: sellerDetails?._id,
      customerId: BuyerId,
    }),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("serviceWorker Failed to send subscription to server");
      }
      return response.json();
    })
    .then((data) => {
      console.log("serviceWorker Subscription sent to server:", data);
      return data;
    })
    .catch((error) => {
      console.error(
        "serviceWorker Failed to send subscription to server:",
        error
      );
      throw error;
    });
};

export const handleServiceWorker = async () => {
  try {
    const registration = await registerServiceWorker();
    const subscription = await subscribePushManager(registration);

    if (subscription) {
      await sendSubscriptionToServer(subscription);
    }
  } catch (error) {
    console.error("serviceWorker Error handling service worker:", error);
  }
};
