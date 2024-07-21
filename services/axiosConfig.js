import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.mulltiply.com",
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("userToken");
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log(config);
    // Parse the URL to check if it's a request to /promos with workspace parameter
    const url = new URL(config.url, axiosInstance.defaults.baseURL);
    if (url.pathname === "/promos" && url.searchParams.get("workspace")) {
      // Exclude Buyer and Seller headers for /promos requests with workspace parameter
      delete config.headers["Seller"];
      delete config.headers["Buyer"];
    } else {
      // Include Buyer and Seller headers for other requests
      let seller_id = "";
      let buyer_id = "";
      if (typeof window !== "undefined") {
        seller_id = localStorage.getItem("SellerWorkspace");
        buyer_id = localStorage.getItem("customerWorkspace");
      }

      if (seller_id) {
        config.headers["Seller"] = seller_id;
      }
      if (buyer_id) {
        config.headers["Buyer"] = buyer_id;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
