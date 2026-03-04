import { useGetListOrderByUserId } from '@/hooks/Order/useGetListOrderByUserId'
import { formatBigNumber } from '@/lib/format-big-number'
import { PaginationCustom } from '@/lib/PaginationCustom'
import { orderStore } from '@/store/orderStore/orderStore'
import { reviewStore } from '@/store/reviewStore/reviewStore'
import dayjs from 'dayjs'
import { ArrowUpAZ, CircleDollarSign, CircleX, Clock, ClockCheck, Handbag, Package, PackageCheck, Star, Truck, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export const OrderList = () => {
    const { createReview } = reviewStore()
    const { updatePaymentStatus } = orderStore()
    const [review, setReview] = useState(null)
    console.log(review, "reviewreviewreviewreview")
    const [valuePage, setValuePage] = useState(1)
    const [status, setStatus] = useState("ALL")
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [loading, setLoading] = useState(false)
    const [comment, setComment] = useState("")
    const [modal, setModal] = useState(false)
    const [orderId, setOrderId] = useState(null)
    const { orderUsers, isLoading, refreshOrderUsers } = useGetListOrderByUserId({
        page: valuePage,
        limit: 6,
        status: status
    })
    useEffect(() => {
        refreshOrderUsers()
    }, [status, valuePage])
    console.log(orderUsers, "orderUsersorderUsersorderUsersorderUsersorderUsers")
    const dataProcess = {
        ALL: {
            sta: "Tất cả",
            icon: <ArrowUpAZ size={20} />
        },
        PENDING: {
            sta: "Chờ xác nhận",
            icon: <Clock size={20} />
        },
        CONFIRMED: {
            sta: "Đã xác nhận",
            icon: <ClockCheck size={20} />
        },
        PACKAGING: {
            sta: "Đang đóng gói",
            icon: <Package size={20} />
        },
        SHIPPED: {
            sta: "Đã vận chuyển",
            icon: <Truck size={20} />
        },
        COMPLETED: {
            sta: "Đã giao",
            icon: <PackageCheck size={20} />
        },
        CANCELLED: {
            sta: "Đã hủy",
            icon: <CircleX size={20} />
        }
    }
    const handleSubmit = async () => {
        if (!review?.items[0].productId._id || !review._id || !rating || !comment) {
            toast.error("Thiếu thông tin để đánh giá")
            return
        }
        setLoading(true)
        console.log(review?.items[0].productId._id, review._id, rating, comment, "vnfvffj")
        const res = await createReview(review?.items[0].productId._id, review._id, rating, comment)
        if (res.status === 201) {
            toast.success("Đánh giá thành công");
            setLoading(false)
            setComment("");
            setRating(0)
            setHover(0)
            setReview(null);
        }
    }
    const handleUpdatePaymentStatus = async () => {
        if (orderId) {
            const res = await updatePaymentStatus(orderId, "FAILED")
            if (res.status === 200) {
                toast.success("Hủy đơn hàng thành công")
                setModal(false)
                setOrderId(null)
                await refreshOrderUsers()
            }
        }
    }
    return (
        <div className="space-y-4 relative min-h-screen pb-16">
            {(isLoading) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <h2 className='mt-13 font-bold text-[28px] text-primary'>My Order</h2>
            <div className='flex justify-end items-end'>
                <select name="" id="" value={status} onChange={(e) => setStatus(e.target.value)} className='border border-primary p-3 rounded-xl mb-6'>
                    <option value="">--- Chọn trạng thái ---</option>
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PACKAGING">Đang đóng gói</option>
                    <option value="SHIPPED">Đã vận chuyển</option>
                    <option value="COMPLETED">Đã giao</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>
            </div>
            {orderUsers?.data?.data?.data?.map((order) => (
                <div
                    key={order._id}
                    className="rounded-lg p-4 shadow-xl bg-white py-4"
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className='flex items-center gap-3'>
                            <p className="font-medium text-secondary">
                                {order.orderCode}
                            </p>
                            <p className="text-sm text-gray-500">
                                {dayjs(order.createdAt).format("YYYY-MM-DD")}
                            </p>
                        </div>

                        <div className='space-x-2 flex items-center gap-2'>
                            <span
                                className="px-3 py-1 text-sm rounded-full bg-secondary text-white"
                            >
                                {order.paymentStatus === "PAID" ? "Đã thanh toán" : order.paymentStatus === "FAILED" ? "Đã hủy" : "Thanh toán khi nhận hàng"}
                            </span>
                            {order.paymentStatus !== "FAILED" && <div className='flex items-center gap-2 bg-primary rounded-full px-3 py-1 text-white'>
                                <span>{dataProcess[order?.status].icon}</span>
                                <span
                                    className=" text-sm"
                                >
                                    {dataProcess[order?.status].sta}
                                </span>
                            </div>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => {
                            const img = item.productId.images.find((i) => i.isMain)
                            return (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12.5 h-12.5 rounded-xl overflow-hidden'>
                                            <img src={img.url} alt="" className='w-full h-full object-cover' />
                                        </div>
                                        <span className='font-bold text-primary'>{item.productId?.name}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm text-secondary">
                            Thanh toán: {order.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}
                        </div>
                        <div className="font-semibold text-xl text-primary">
                            {formatBigNumber(Math.ceil(order.total), true)}
                        </div>
                    </div>
                    <div className='flex justify-between items-center mt-4 relative'>
                        <div>
                            {order.status === "COMPLETED" && (
                                <button onClick={() => setReview(order)} className="btn rounded-sm px-2 py-1 text-[14px] bg-transparent border border-primary text-primary cursor-pointer">
                                    Đánh giá
                                </button>
                            )}
                        </div>
                        {order.paymentStatus !== "PAID" && order.paymentStatus !== "FAILED" && order.status === "PENDING" ? <div className='' onClick={() => {
                            setModal(true)
                            setOrderId(order._id)
                        }}>
                            <button className='btn rounded-sm px-2 py-1 text-[14px] bg-transparent border border-primary text-primary cursor-pointer'>
                                Hủy đơn hàng
                            </button>
                        </div> : ""}
                    </div>
                </div>
            ))}
            {modal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-96 shadow-xl relative">

                        <h3 className="text-lg font-semibold mb-4">
                            Xác nhận hủy đơn
                        </h3>

                        <p className="text-gray-600 mb-6">
                            Bạn có chắc muốn hủy đơn hàng không?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setModal(false)
                                    setOrderId(null)
                                }
                                }
                                className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                            >
                                Không
                            </button>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer" onClick={handleUpdatePaymentStatus}
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className='grid grid-cols-3 gap-6 my-12'>
                <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                    <div className='size-10 bg-primary flex items-center justify-center text-white rounded-full'>
                        <Handbag size={20} />
                    </div>
                    <p className='text-[24px] font-bold text-primary'>{orderUsers?.data?.data?.total}</p>
                    <p className='font-medium text-[14px] text-[#4B5563]'>Tổng đơn hàng</p>
                </div>
                <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                    <div className='size-10 bg-secondary flex items-center justify-center text-white rounded-full'>
                        <CircleDollarSign size={20} />
                    </div>
                    <p className='text-[24px] font-bold text-primary'>{formatBigNumber(Math.ceil(orderUsers?.data?.data?.totalPriceOrder), true)}</p>
                    <p className='font-medium text-[14px] text-[#4B5563]'>Tổng tiền</p>
                </div>
                <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                    <div className='size-10 bg-primary flex items-center justify-center text-white rounded-full'>{dataProcess[status]?.icon}</div>
                    <p className='text-[24px] font-bold text-primary'>{orderUsers?.data?.data?.timeProcess}</p>
                    <p className='font-medium text-[14px] text-[#4B5563]'>{dataProcess[status]?.sta}</p>
                </div>
            </div>
            {review && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

                <div className="bg-white rounded-2xl p-6 w-112.5 relative shadow-xl">

                    <button
                        onClick={() => setReview(null)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                    >
                        <X />
                    </button>

                    <h3 className="text-lg font-semibold mb-4">
                        Đánh giá đơn #{review?.orderCode}
                    </h3>
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={28}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className={`cursor-pointer transition 
                                ${(hover || rating) >= star
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                            />
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Nhập cảm nhận của bạn..."
                        className="w-full border rounded-xl p-3 min-h-25 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            onClick={() => setReview(null)}
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                            Hủy
                        </button>

                        <button
                            disabled={!rating || loading}
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </div>

                </div>
            </div>}
            <PaginationCustom total={orderUsers?.data?.data?.total} valuePage={valuePage} handleChangePage={(e, value) => setValuePage(value)} limit={6} />
        </div>
    )
}
