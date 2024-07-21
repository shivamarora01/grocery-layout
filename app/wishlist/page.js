"use client"
import axiosInstance from "@/services/axiosConfig";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { Base_url } from "@/constants/Links";

export default function Example() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initialize loading state to true

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const urii = localStorage.getItem("uri");
            const response = await axiosInstance.get(`https://api.mulltiply.com/offers/wish-list?uri=${urii}`);
            setProducts(response.data.data);
            setIsLoading(false); // Set loading state to false after data is fetched
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const RemoveWishlist = async (id) => {
        const uri = localStorage.getItem("uri");
        await axiosInstance.post(`https://api.mulltiply.com/offers/wish-list/remove-item`, {
            "uri": uri,
            "item": id
        });

        fetchData();
    };

    return (
        <div className="bg-white font-book-antiqua">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Products</h2>

                {isLoading ? (
                    <div className=" overflow-y-auto flex items-center justify-center h-full rounded-t-lg p-3 w-full px-3">
                        <div className="flex justify-center items-center h-96">
                            <div className="w-16 h-16 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    // Show wishlist empty message if no products
                    <div className="flex flex-col justify-center items-center">
                        <img src="wishlistEmpty.svg" alt="Empty Wishlist" className="w-96" />
                        <h1>YOUR WISHLIST IS EMPTY</h1>
                    </div>
                ) : (
                    // Render products if available
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <div key={product.attributeSet?.item?._id} className="group">
                                <Link href={`/collections/${product.attributeSet?.item?._id}?name=${product.attributeSet?.item?.itemName}`} className="block">
                                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg  xl:aspect-h-8 xl:aspect-w-7">
                                        {product.attributeSet?.item?.itemImages?.[0] ? (
                                            <img
                                                src={Base_url + product.attributeSet.item.itemImages[0]}
                                                alt={product.imageAlt || 'Product Image'}
                                                className="h-full w-full object-cover object-center group-hover:opacity-75"
                                            />
                                        ) : (
                                            <div className="h-full w-full  flex items-center justify-center">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mt-4 text-sm text-gray-700">{product.attributeSet?.item?.itemName}</h3>
                                </Link>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-lg font-medium text-gray-900">₹{product.attributeSet?.mrp?.pricePerUnit}</p>
                                    <FaHeart onClick={() => RemoveWishlist(product.attributeSet?.item?._id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
