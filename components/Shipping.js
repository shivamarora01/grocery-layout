"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosConfig";
export default function Shipping() {
    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const domain = window?.location?.hostname;
                const subdomain = domain.split(".")[0];
                const response = await axiosInstance.post(
                    "/users/workspace/subdomain",
                    {
                        mulltiplyURL: subdomain,
                    }
                );
                setData(response);
                console.log("response", response?.data.data);

                localStorage.setItem("uri", response.data.data.uri.uri);
                localStorage.setItem("COD", response.data.data.cod);
                localStorage.setItem(
                    "PartialPayment",
                    response.data.data.partialPaymentPercentageOnCod
                );

                localStorage.setItem(
                    "SellerDetails",
                    JSON.stringify(response.data.data)
                );
                localStorage.setItem("SellerWorkspace", response.data.data._id);
                localStorage.setItem("SellerWorkspace", response.data.data._id);

                localStorage.setItem("SellerId", response.data.data.customerId);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData().then(() => {
            if (typeof window !== "undefined" && window.localStorage) {
                const storedCartData = localStorage.getItem("cartData");
                const sellerWorkspace = localStorage.getItem("SellerWorkspace");
                const sellerId = localStorage.getItem("SellerId");
                const uri = localStorage.getItem("uri");
                if (!storedCartData) {
                    const cartData = {
                        items: [],
                        buyerEmail: "",
                        buyerGST: "",
                        sellerWorkspace: sellerWorkspace,
                        sellerId: sellerId,
                        uri: uri,
                        promoCodes: [],
                    };
                    localStorage.setItem("cartData", JSON.stringify(cartData));
                } else if (uri !== null) {
                    const storedCartData = JSON.parse(localStorage.getItem("cartData"));
                    storedCartData.uri = uri;
                    localStorage.setItem("cartData", JSON.stringify(storedCartData));
                } else if (sellerWorkspace === null || sellerId === null) {
                    const storedCartData = JSON.parse(localStorage.getItem("cartData"));
                    const sellerWorkspace = localStorage.getItem("SellerWorkspace");
                    const sellerId = localStorage.getItem("SellerId");
                    storedCartData.sellerWorkspace = sellerWorkspace;
                    storedCartData.sellerId = sellerId;
                    localStorage.setItem("cartData", JSON.stringify(storedCartData));
                }
            }
        });
    }, []);

    return (
        <>
            <div
                dangerouslySetInnerHTML={{
                    __html: data?.data?.data?.shippingAndDelivery,
                }}
                className="px-5 py-10"
            />
        </>
    );
}