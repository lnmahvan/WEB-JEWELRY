
import { sendEmail } from "../config/sendEmail.js";
import paymentService from "../services/payment.service.js";
import BaseController from "./base.controller.js";


class PaymentController extends BaseController {
    createPaymentLink = async (req, res) => {
        try {
            const { orderId } = req.body;
            console.log("Received orderId:", orderId);
            const paymentLink = await paymentService.createPaymentIntent(orderId);
            return this.created(res, paymentLink, "Payment link created successfully");
        } catch (error) {
            return this.handleErr(res, error);
        }
    }
    createPaymentLinkCustom = async (req, res) => {
        try {
            const { id } = req.body;
            const paymentLink = await paymentService.createPaymentCustom(id);
            return this.created(res, paymentLink, "Payment link created successfully");
        } catch (error) {
            return this.handleErr(res, error);
        }
    }
    paymentCallbackCustom = async (req, res) => {
        try {
            const { code, id, cancel, status, orderCode } = req.query;
            const result = await paymentService.handlePaymentCallbackCustom({
                code,
                id,
                cancel: cancel === "true",
                status,
                orderCode,
            });
            if (result?.cusOrder.paymentStatus === "PAID") {
                await sendEmail(result.emailUser, result.cusOrder)
            }
            return this.ok(res, result, "Thành Công")
        } catch (error) {
            console.error("Payment callback error:", error);
            return this.handleErr(res, error);
        }
    }
    paymentCallback = async (req, res) => {
        try {
            const { code, id, cancel, status, orderCode } = req.query;
            console.log("Payment callback received:", { code, id, cancel, status, orderCode });
            const result = await paymentService.handlePaymentCallback({
                code,
                id,
                cancel: cancel === "true",
                status,
                orderCode,
            });
            if (result.orderSuc.paymentStatus === "PAID") {
                await sendEmail(result.emailUser, result.orderSuc)
            }
            return this.ok(res, result, "Thành công")
        } catch (error) {
            console.error("Payment callback error:", error);
            return this.handleErr(res, error);
        }
    }

    webhook = async (req, res) => {
        try {
            const result = await paymentService.handleWebhook(req.body);
            return this.ok(res, result, "Webhook processed");
        } catch (error) {
            return this.handleErr(res, error);
        }
    }
}
export default new PaymentController();
