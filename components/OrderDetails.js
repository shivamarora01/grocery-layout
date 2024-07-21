"use c"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { RxCross1 } from "react-icons/rx";
import axiosInstance from '@/services/axiosConfig';

const OrderDetails = ({ order, onClose }) => {
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        // Function to fetch payment details for the entire order
        const fetchPaymentDetailsForOrder = async () => {
            try {
                const response = await axiosInstance.get(`/orders/order-payments/${order.attributeSet.items[0].refOrderId}`);
                setPaymentData(response.data.data.attributeSet.paymentDetails);
            } catch (error) {
                console.error('Failed to fetch order payment details:', error);
                setPaymentData(null);
            }
        };

        // Fetch payment details for the current order
        fetchPaymentDetailsForOrder();
    }, [order]);

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 font-book-antiqua">
            <div className="bg-white p-6 rounded-lg w-[90%] lg:max-w-2xl relative">
                <button className="absolute top-0 right-0 mt-2 mr-2 text-gray-600" onClick={onClose}><RxCross1 /></button>
                <h3 className="text-xl font-bold mb-4">Order Details</h3>
                <div className="flex flex-col lg:flex-row justify-between">
                    <div>
                        <p className="text-gray-500">Order ID: {order?.identifier?.orderNumber}</p>
                        <p className="text-gray-500">Ordered on: {new Date(order.attributeSet.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-500">Order Status: {order.attributeSet.orderStatus.replace('ORDER_', '')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Order Amount : ₹ {order.attributeSet.orderTotalWithGST.amount}</p>
                        <p className="text-sm text-gray-500">Payment Method : {order.attributeSet.paymentMethod}</p>
                        <p className="text-sm text-gray-500">Payment Status: {order.attributeSet.paymentStatus}</p>
                    </div>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    <h4 className="text-lg font-semibold mb-2 mt-2">Items</h4>
                    <div>
                        {order.attributeSet.items.map((item, index) => (
                            <div key={item._id} className="flex flex-col lg:flex-row justify-between border-b-2 py-2">
                                <div className="flex space-x-4 py-2">
                                    <Link href={`/item/${item.itemRef}`}>
                                        <img className="w-28 lg:w-40 h-28 lg:h-40 object-cover rounded" src={`https://mulltiply.com/cdn-cgi/image/width=800,quality=75/https://files.mulltiply.com/${item.itemImages[0]}`} alt={item.itemName} />
                                    </Link>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.itemName}</p>
                                        <p className="text-xs text-gray-500">Size: {item.size || 'N/A'}</p>
                                        <p className="text-xs text-gray-500 mt-1 font-semibold">Quantity: {item.quantity}</p>
                                        <p className="text-xs text-gray-500 mt-1">Price Per Unit: ₹{item.unitPrice.amount}</p>
                                        <p className="text-xs text-gray-500 mt-1">Total Price : ₹{paymentData?.totalAmount}</p>
                                        { order.attributeSet.paymentMethod === 'COD'&& (<p className="text-xs text-gray-500 mt-1">₹150 extra charges for COD</p>)}

                                        <p className="text-xs text-gray-500 mt-1">Exchange/Return window closed on {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Display payment data for the entire order */}
                {paymentData && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold">Payment Details</h4>
                        <p>Total Amount: {paymentData.totalAmount}</p>
                        <p>Paid Amount: {paymentData.totalPaidAmount}</p>
                        <p>Remaining Amount: {paymentData.remainingAmount}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
