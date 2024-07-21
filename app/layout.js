import { Inter } from "next/font/google";
import "./globals.css";
import axios from "axios";
import Nav from "@/components/Nav.js";
import { AuthProvider } from "@/context/Auth.js";
import { CartProvider } from "@/context/CartContext.js";
import Cart from "@/components/Cart.js";
import Item from "@/components/Item.js";
import { StateProvider } from "@/context/StateContext.js";
import Checkout from "@/components/Checkout.js";
import ChildRenderer from "@/components/ChildRenderer.js";
import FiltersOptions from "@/components/FiltersOptions.js";
import Ticker from "@/components/Ticker";
import { getWorkSpaceData } from "@/services/action";
import Footer from "@/components/Footer";
import { NotificationProvider } from "@/context/NotificationContext.js";

export const metadata = {
  manifest: "/manifest.json",
};

axios.interceptors.request.use((request) => {
  // console.log(request);
  return request;
});

export default async function RootLayout({ children }) {
  // console.log("favIconLink", await getWorkSpaceData());
  const workspaceData = await getWorkSpaceData();
  console.log("workspaceData", workspaceData);
  const favicon =
    "https://files.mulltiply.com/" + workspaceData?.sellingProfile?.logo;

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href={favicon} />
      </head>
      <body className="font-serif ">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <StateProvider>
                <Ticker />
                <Nav />
                {/* <ChildRenderer> */}
                <div className=" sm:flex  sm:justify-center ">
                  <div className="sm:max-w-[82rem]">{children}</div>
                </div>
                {/* </ChildRenderer> */}
                <Cart />
                <Item />
                {/* <Checkout /> */}
                <FiltersOptions />
                <Footer />
                {/* <Ssl /> */}
              </StateProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
