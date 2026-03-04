import express from "express";
import paymentController from "../controller/payment.controller.js";

const route = express.Router();
route.post("/", paymentController.createPaymentLink);
route.post("/custom", paymentController.createPaymentLinkCustom)
route.post('/success', paymentController.paymentCallback)
route.post('/cancel', paymentController.paymentCallback)
route.post("/success/custom", paymentController.paymentCallbackCustom)
route.post("/cancel/custom", paymentController.paymentCallbackCustom)
export default route;
