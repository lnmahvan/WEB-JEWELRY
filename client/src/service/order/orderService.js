
import { API_CREATE_ORDER, API_GET_ORDERS_BY_USER_ID, API_ORDER, API_PREVIEW_ORDER, API_UPDATE_ORDER_STATUS, API_UPDATE_PAYMENTSTATUS, API_USE_COUPON } from "@/api/api"
import axiosClient from "../axiosClient"

export const orderService = {
    getAllOrder: async (params) => {
        try {
            const res = await axiosClient.get(API_ORDER, { params })
            console.log(res, "resssss")
            if (res.status === 200) {
                return res;
            }
        } catch (error) {
            throw error
        }
    },
    previewOrder: async (payload) => {
        console.log(payload, "payloadpayloadService")
        try {
            const res = await axiosClient.post(API_PREVIEW_ORDER, payload)
            return res;
        } catch (error) {
            throw error;
        }
    },
    useCoupon: async (code, totalPrice) => {
        console.log(code, totalPrice, "pyyupyupyo")
        try {
            const res = await axiosClient.post(API_USE_COUPON, { code, totalPrice })
            if (res.status === 200) {
                return res;
            }
        } catch (error) {
            throw error
        }
    },
    createOrder: async (payload) => {
        try {
            const res = await axiosClient.post(API_CREATE_ORDER, payload)
            return res;
        } catch (error) {
            throw error;
        }
    },
    getOrderByUserId: async (params) => {
        console.log(params, "payloadpayloadpayload")
        try {
            console.log(params, "payloadpayloadpayload")
            const res = await axiosClient.get(API_GET_ORDERS_BY_USER_ID, { params })
            console.log(res, "mbgmbg")
            if (res.status === 200) {
                return res;
            }
        } catch (error) {
            console.log(error)
            throw error;
        }
    },
    updateOrderStatus: async (id, status) => {
        try {
            const res = await axiosClient.put(`${API_UPDATE_ORDER_STATUS}/${id}/status`, { status })
            if (res.status === 200) {
                return res;
            }
        } catch (error) {
            throw error
        }
    },
    updatePaymentStatus: async (id, paymentStatus) => {
        try {
            const res = await axiosClient.put(`${API_UPDATE_PAYMENTSTATUS}/${id}/payment-status`, { paymentStatus })
            if (res.status === 200) {
                return res;
            }
        } catch (error) {
            throw error
        }
    }
}
