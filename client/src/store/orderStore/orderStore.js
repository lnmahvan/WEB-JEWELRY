import { orderService } from "@/service/order/orderService";
import { create } from "zustand";

export const orderStore = create(() => ({
    previews: {},
    setPreview: (data) => {
        orderStore.setState({ previews: data });
    },
    previewOrder: async (payload) => {
        console.log(payload, "payloadpayload")
        const res = await orderService.previewOrder(payload)
        return res;
    },
    useCoupon: async (code, totalPrice) => {
        console.log(code, totalPrice, "bjgnjtn")
        const res = await orderService.useCoupon(code, totalPrice)
        return res;
    },
    createOrder: async (payload) => {
        const res = await orderService.createOrder(payload)
        return res;
    },
    updateOrderStatus: async (id, status) => {
        const res = await orderService.updateOrderStatus(id, status)
        return res;
    },
    updatePaymentStatus: async (id, paymentStatus) => {
        const res = await orderService.updatePaymentStatus(id, paymentStatus);
        return res;
    }
}))