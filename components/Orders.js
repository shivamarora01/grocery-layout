import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosConfig';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";
import OrderDetails from './OrderDetails'; // Import OrderDetails component

const DateRangeSelector = ({ onChange }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleFromDateChange = (event) => {
        setFromDate(event.target.value);
    };

    const handleToDateChange = (event) => {
        setToDate(event.target.value);
    };

    const handleApply = () => {
        onChange(fromDate, toDate);
    };

    return (
        <div className="flex items-center justify-center mb-4 mx-2 mt-2 ">
            <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className=" border border-gray-300 px-3 py-2 mt-3 mr-1 md:mr-2 text-sm md:text-md"
            />
            <span className="mx-2 mt-3">to</span>
            <input
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                className=" border border-gray-300 mt-3 px-3 py-2 ml-1 md:ml-2 mr-2 text-sm md:text-md"
            />
            <button onClick={handleApply} className="mt-3  md:mx-7 bg-[#A18168] text-white px-8 py-2 rounded">
                Apply
            </button>
        </div>
    );
};

const Orders = () => {
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
        <div className='mx-1'>
            <Skeleton height={120} width={`100%`} />
        </div>
    );

    return (
        <div className="w-full font-book-antiqua ">
            <h2 className="text-2xl font-bold mx-2 md:mx-2 md:px-0 text-center">MY ORDERS</h2>
            {/* <DateRangeSelector onChange={handleDateRangeChange} /> */}
            <div className="mx-auto py-8 w-full ">
                {loading ? (
                    <div className="w-full">
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                        {renderLoading()}
                    </div>
                ) : (
                    <div className="w-full px-2  ">
                        {orders.map((order, index) => (
                            <div key={order._id} onClick={() => openOrderDetails(order)} className="cursor-pointer flex flex-row justify-between my-2 px-2 bg-gray-100 rounded-md">
                                <div className=" py-8 px-4 text-xs md:text-lg">
                                    <p>{order?.identifier?.orderNumber}</p>
                                    <p className="text-gray-500 text-xs md:text-lg">Total items: {order?.attributeSet?.totalItems}</p>
                                </div>
                                <div className=" py-8 px-4 text-xs md:text-lg">
                                    <p className='text-gray-500 text-xs md:text-lg'> Order Status</p>

                                    <p >{order.attributeSet.orderStatus.replace('ORDER_', '')}</p>
                                </div>
                                <div className=" py-8 px-4  text-xs md:text-lg">

                                    <p>{new Date(order.attributeSet.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <p>Amount: ₹ {order.attributeSet.orderTotalWithGST.amount}</p>

                                </div>
                                <div className=" py-8 px-4  text-xs md:text-lg">
                                    <p className='text-gray-500 text-xs md:text-lg'> Order Payment Status</p>
                                    <p className='text-gray-500 text-xs md:text-lg'> {order.attributeSet.paymentStatus}</p>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
};
export default Orders;
