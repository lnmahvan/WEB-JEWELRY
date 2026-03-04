import { useGetListCustomById } from '@/hooks/Custom/useGetListCustomById'
import { formatBigNumber } from '@/lib/format-big-number'
import { PaginationCustom } from '@/lib/PaginationCustom'
import { CustomStore } from '@/store/customStore/CustomStore'
import dayjs from 'dayjs'
import { RefreshCw } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'

export const DesignRequire = () => {
    const [valuePage, setValuePage] = useState(1)
    const { customIds, error, isLoading, refreshCustomId } = useGetListCustomById({ page: valuePage, limit: 4 })
    console.log(customIds, "customIdscustomIds")
    const navigate = useNavigate()
    const { previewDeign, setPreviewCustom } = CustomStore()
    const handleChangePage = (e, value) => {
        setValuePage(value)
    }
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="loader"></div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500">Có lỗi xảy ra</div>
    }

    const list = customIds?.data?.data?.customs || []
    const handlePreview = async (item) => {
        console.log(item, "vnfvnfnfmbmf")
        const res = await previewDeign(item._id, item.material, item.gem, 1)
        if (res.status === 200) {
            console.log(res, "ressssssssss")
            setPreviewCustom(res?.data?.data)
            navigate("/order/checkout")

        }
    }
    return (
        <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6 rounded-xl shadow-xl my-16">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                    Yêu cầu thiết kế của tôi
                </h2>

                <button
                    onClick={refreshCustomId}
                    className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-80 transition flex items-center gap-2 cursor-pointer"
                >
                    <RefreshCw size={20} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {list.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
                    >
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {item.jewelryType}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {item.material?.name} ({item.material?.purity})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Đá: {item.gem?.name} - {item.carat} {item.gem?.unit}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 text-xs rounded-full font-medium
                                ${item.status === "PENDING"
                                        ? " text-yellow-700"
                                        : item.status === "APPROVED"
                                            ? " text-green-700"
                                            : " text-red-700"
                                    }`}
                            >
                                {item.status === "PENDING"
                                    ? "Đang chờ duyệt"
                                    : item.status === "APPROVED"
                                        ? "Đã chấp thuận"
                                        : "Không chấp thuận"}
                            </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                            <p>Size: {item.size}</p>
                            <p>Gram: {item.gram}</p>
                            <p>
                                Tổng tiền:{" "}
                                <span className="font-semibold text-primary">
                                    {formatBigNumber(item.subTotal, true)}
                                </span>
                            </p>
                        </div>
                        <div className="mt-4">
                            {item.status === "APPROVED" && item.paymentStatus !== "PAID" && (
                                <button
                                    className="w-full bg-primary text-white py-2 rounded-lg
                                    hover:opacity-80 active:scale-95 transition cursor-pointer"
                                    onClick={() => handlePreview(item)}
                                >
                                    Tiến hành thanh toán
                                </button>
                            )}
                            {item.status === "APPROVED" && item.paymentStatus === "PAID" && (

                                <p className='text-green-500'>Đã thanh toán</p>

                            )}
                            {item.status === "CANCELLED" && (
                                <div className="text-center text-red-500 font-medium py-2">
                                    Yêu cầu không được chấp thuận
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 flex justify-between">
                            <span>
                                Tạo: {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                            </span>
                            <span>
                                Cập nhật:{" "}
                                {dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm")}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {list.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    Bạn chưa có yêu cầu thiết kế nào
                </div>
            )}
            <PaginationCustom total={customIds?.data?.data?.totalItem} valuePage={valuePage} handleChangePage={handleChangePage} limit={4} />
        </div>
    )
}
