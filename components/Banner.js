"use client";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Base_url } from "@/constants/Links";
import { useEffect, useState } from "react";
import { handleServiceWorker } from "@/lib/notification";
import { useAuth } from "@/context/Auth";
import { useNotification } from "@/context/NotificationContext";
function Banner({ bannerData }) {
  const { isLogin } = useAuth();
  const { clearNotifications } = useNotification();

  useEffect(() => {
    clearNotifications();
  }, []);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    adaptiveHeight: false,
  };

  useEffect(() => {
    const handleNotification = async () => {
      if (
        "serviceWorker" in navigator &&
        (isLogin || localStorage.getItem("isLogin") === "true")
      ) {
        console.log("handleServiceWorker handleServiceWorker");
        await handleServiceWorker();
      }
    };

    handleNotification();
  }, []);

  return (
    <>
      {bannerData && bannerData?.length > 0 && (
        <div className="banner-container mt-6">
          <Slider {...settings}>
            {bannerData?.map((image, index) => (
              <div key={index} className="h-64">
                <img
                  src={`${Base_url}${image.image}`}
                  alt={`Image ${index}`}
                  className="w-full h-full sm:object-contain sm:object-contain lg:object-cover xl:object-cover object-contain rounded-sm"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </>
  );
}

export default Banner;
