"use client";
import { updateBadgeCount, clearBadge } from "@/utils/badge";
import React, { createContext, useState, useContext, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(() => {
    return (
      (typeof window !== "undefined" &&
        window.localStorage &&
        parseInt(localStorage.getItem("notificationCount"), 10)) ||
      0
    );
  });

  useEffect(() => {
    updateBadgeCount(notificationCount);
    typeof window !== "undefined" &&
      window.localStorage &&
      localStorage.setItem("notificationCount", notificationCount);

    return () => {
      clearBadge();
    };
  }, [notificationCount]);

  const incrementNotifications = () => {
    setNotificationCount((prevCount) => prevCount + 1);
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  useEffect(() => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NEW_NOTIFICATION") {
          incrementNotifications();
        }
      });
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notificationCount, incrementNotifications, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
