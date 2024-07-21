"use client";
import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { Base_url } from "@/constants/Links";
import axiosInstance from "@/services/axiosConfig";
import { storage } from "./Storage"; // Import your storage utility

export default function PwaModal({ workspaceData }) {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchData();
    checkPwaModalShown();
  }, []);

  const fetchData = async () => {
    try {
      setLogo(workspaceData.sellingProfile.logo);
      console.log("logo", workspaceData.sellingProfile.logo);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const checkPwaModalShown = () => {
    const pwaModalShown = storage.isPwaModalShown();
    if (!pwaModalShown && storage.isLocationModalShown()) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  };

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    setPrompt(event);
    if (!window.matchMedia("(display-mode : standalone)").matches) {
      setShowInstallModal(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (prompt) {
      prompt.prompt();
    }
  };

  const handleCloseModal = () => {
    setShowInstallModal(false);
    storage.setPwaModalShown(); // Set the flag in session storage
  };

  const blurbackground = showInstallModal ? "backdrop-blur" : "";

  return (
    showInstallModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-slideIn">
        <div className="bg-white w-72 h-72 p-4 rounded-lg shadow-lg my-2">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-semibold mb-2 text-black">
              Install the App
            </h2>
            <MdOutlineCancel
              onClick={handleCloseModal}
              className="cursor-pointer"
              size={24}
            />
          </div>
          <p>
            Enhance your experience. Tap below to add our app to your home
            screen!
          </p>
          {logo && (
            <div className="flex justify-center">
              {" "}
              <img
                className="h-24 object-contain text-center"
                src={`${Base_url}${logo}`}
                alt="App Logo"
              />
            </div>
          )}
          <div className="flex flex-row justify-center space-x-6 mt-2">
            <button
              onClick={handleInstallClick}
              className="hover:bg-[#619b1a] bg-[#5FAC00] text-white px-4 py-2 rounded-md"
            >
              Install App
            </button>
          </div>
        </div>
        <div
          className={`fixed inset-0 bg-gray-900 opacity-70 -z-10 ${blurbackground}`}
        ></div>
      </div>
    )
  );
}
