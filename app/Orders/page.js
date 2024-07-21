"use client"
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosConfig';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";
import OrderDetails from '@/components/OrderDetails'; // Import OrderDetails component
import { useStateContext } from '@/context/StateContext';

const Orders = () => {
    const {cartCount, increaseCartCount, decreaseCartCount, setShowNav, setShowCheckout, categoryIdForSorting,setCategoryIdForSorting, choosenSortMethod, setChoosenSortMethod, showSortingOptions, setShowSortingOptions, showItem, setShowItem , filterData,  setFilterData, ItemId, setItemId,  setShowCart, totalCartPrice, setTotalCartPrice } = useStateContext()

    const [filters, setFilters] = useState({
        page: 1,
        limit: 5,
        orderStatus: '',
    });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [expandedOrder, setExpandedOrder] = useState(null); // Track expanded order
    const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order for displaying details

    useEffect(() => {
        setShowNav(true)
        fetchOrders();
    }, [filters]); // Trigger useEffect when filters change

    const fetchOrders = async () => {
        setLoading(true);

        const seller = localStorage.getItem("SellerWorkspace");
        const { orderStatus, page, limit, fromDate, toDate } = filters;
        let statusParam = orderStatus ? `&orderStatus=${orderStatus}` : '';
        const queryString = `/orders/my-orders?page=${page}&limit=${limit}&sellerWorkspace=${seller}${statusParam}`;

        try {
            const response = await axiosInstance.get(queryString);
            setOrders(response.data.data);
            setTotalOrders(response.data.totalCount);
            setTotalPages(Math.ceil(response.data.totalCount / limit));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
        setLoading(false);
    };

    const handleStatusChange = (status) => {
        setFilters({ ...filters, orderStatus: status, page: 1 });
    };

    const handlePageChange = (page) => {
        setFilters({ ...filters, page });
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    const handleDateRangeChange = (fromDate, toDate) => {
        setFilters({ ...filters, fromDate, toDate });
    };

    const renderLoading = () => (
        <div className=''>
            <Skeleton height={120} width={`100%`} />
        </div>
    );

    return (
        <div className="w-full font-book-antiqua ">
            <h2 className="text-2xl font-bold mx-2 mt-4 md:px-0 text-center">MY ORDERS</h2>
            {/* <DateRangeSelector onChange={handleDateRangeChange} /> */}
            <div className="mx-auto py-8 w-full flex justify-center ">
                {loading ? (
                    <div className=" w-full">
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                    </div>
                ) : (
                    <div className="md:w-[80%] w-full ">
                        {orders.map((order, index) => (
                            <div key={order._id} onClick={() => openOrderDetails(order)} className="cursor-pointer flex flex-col md:flex-row justify-between my-2 px-2 bg-gray-100 rounded-md">
                                <div className=" pt-2 md:py-8 px-2 md:px-4 text-xs md:text-base">
                                    <p>{order?.identifier?.orderNumber}</p>
                                    <p className="text-gray-500 text-xs md:text-base">Total items: {order?.attributeSet?.totalItems}</p>
                                </div>
                                <div className=" py-2 md:py-8 px-2 md:px-4 text-xs md:text-base">
                                    <p className='text-gray-500 text-xs md:text-base'> Order Status</p>
                                    <p >{order.attributeSet.orderStatus.replace('ORDER_', '')}</p>
                                </div>
                                <div className=" py-2 md:py-8 px-2 md:px-4 text-xs md:text-base">
                                    <p>{new Date(order.attributeSet.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <p>Amount: ₹ {order.attributeSet.orderTotalWithGST.amount}</p>
                                </div>
                                <div className=" py-2 md:py-8 px-2 md:px-4 text-xs md:text-base">
                                    <p className='text-gray-500 text-xs md:text-base'> Order Payment Status</p>
                                    <p className='text-gray-500 text-xs md:text-base'> {order.attributeSet.paymentStatus}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`p-2 rounded-sm mx-1 ${filters.page === index + 1 ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
            {selectedOrder && <OrderDetails order={selectedOrder} onClose={closeOrderDetails} />}
        </div>
    );
};
export default Orders;
