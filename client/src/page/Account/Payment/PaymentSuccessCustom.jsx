import axiosClient from "@/service/axiosClient"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"

export const PaymentSuccessCustom = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(true)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const code = params.get("code")
        const orderCode = params.get("orderCode")

        if (!orderCode) {
            toast.error("Không tìm thấy mã đơn hàng")
            navigate("/payment-failed", { replace: true })
            return
        }

        axiosClient.post(`api/payment/success/custom${location.search}`)
            .then((res) => {
                console.log(res, "resresres")
                const paymentStatus = res.data?.data?.cusOrder?.paymentStatus
                if (code === "00" && paymentStatus === "PAID") {
                    setIsProcessing(false)
                    setShowSuccess(true)
                } else {
                    navigate("/payment-failed", { replace: true })
                }
            })
            .catch((err) => {
                toast.error("Không thể xác nhận thanh toán")
                navigate("/payment-failed", { replace: true })
            })
    }, [location.search, navigate])

    if (isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-300 animate-spin"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác nhận...</h2>
                        <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                    <div className="flex gap-2 justify-center mt-8">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                </div>
            </div>
        )
    }
    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f0fdf4] to-[#dbeafe]">
                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md mx-4 transform transition-all duration-500 scale-100 animate-in fade-in zoom-in">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                            <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900">Thanh toán thành công!</h1>
                        <p className="text-gray-600 text-lg">
                            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
                        </p>
                        <div className="bg-linear-to-r from-primary to-secondary rounded-lg p-4 my-6">
                            <p className="text-sm text-white mb-1">Mã đơn hàng:</p>
                            <p className="text-xl font-bold text-white font-mono">
                                {new URLSearchParams(location.search).get("orderCode")}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
                        >
                            <Home className="w-5 h-5" />
                            <span className="cursor-pointer">Trang chủ</span>
                        </button>
                        <button
                            onClick={() => navigate("/cart")}
                            className="flex items-center justify-center gap-2 bg-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="cursor-pointer">Giỏ hàng</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
