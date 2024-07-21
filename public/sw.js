self.addEventListener("push", (event) => {
  console.log("Push event received:", event?.data?.json());
  const data = event?.data?.json();
  const title = data.title || "Default title";
  const options = {
    body: data.body || "Default body",
    icon: data.icon || "/default-icon.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event?.notification?.data;
  const url = event?._notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: "NEW_NOTIFICATION",
          payload: data,
        });
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
