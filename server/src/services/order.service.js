import { BadRequest, Unauthorized } from "../core/error.response.js";
import cartModel from "../models/cart.model.js";
import couponModel from "../models/coupon.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";

class OrderService {
    async getAllOrder(page, limit, status) {
        const skip = (page - 1) * limit;
        const filter = {};
        if (status && status !== "ALL") {
            filter.status = status
        }
        const [orders, totalItem] = await Promise.all([
            orderModel
                .find(filter)
                .populate("userId")
                .populate("items.productId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            orderModel.countDocuments(filter)
        ]);
        return {
            data: orders,
            page,
            limit,
            totalItem,
            totalPage: Math.ceil(totalItem / limit),
        };
    }
    async previewOrder(userId, orderData) {
        const now = new Date();
        console.log(orderData, "orderDataorderData")
        if (!userId) {
            throw new BadRequest("Thiếu thông tin người dùng");
        }
        const { items } = orderData;

        if (!items || items.length === 0) {
            throw new BadRequest("Đơn hàng phải có ít nhất một sản phẩm");
        }
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) {
                throw new NotFound(`Sản phẩm ${item.productId} không tồn tại`);
            }

            if (!item.quantity || item.quantity < 1) {
                throw new BadRequest("Số lượng sản phẩm phải >= 1");
            }
            let itemTotal = 0;
            let p = 0
            if (product.promotion.isActive && product.promotion.startAt <= now && product.promotion.endAt >= now) {
                p = product.promotion.discount ? product.promotion.discount : 0;
                itemTotal = (item.unitPrice * item.quantity) - (item.unitPrice * item.quantity * (product.promotion.discount ? product.promotion.discount / 100 : 0));
            } else {
                itemTotal = item.unitPrice * item.quantity;
            }
            subtotal += itemTotal;
            processedItems.push({
                productId: item.productId,
                sku: item.sku || "",
                name: product.name || "",
                images: product.images || [],
                type: item.type || "NONE",
                value: item.value || null,
                purity: item.purity || "",
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: itemTotal,
                discount: p,
            });
        }
        const TAX_RATE = 0.05;
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const total = subtotal + tax;
        const previewOrder = {
            userId,
            items: processedItems,
            subtotal,
            tax,
            total,
            currency: "VND",
        };
        return previewOrder;
    }
    async useCoupon(userId, code, totalPrice) {
        if (!userId) {
            throw new BadRequest("Thiếu thông tin người dùng");
        }
        if (!code) {
            throw new BadRequest("Thiếu mã giảm giá");
        }
        const now = new Date();
        const cou = await couponModel.findOne({ code: code, isActive: true });
        if (!cou) {
            throw new BadRequest("Mã giảm giá không hợp lệ");
        }
        if (cou.startDate && now < cou.startDate) {
            throw new BadRequest("Mã giảm giá chưa có hiệu lực");
        }
        if (cou.endDate && now > cou.endDate) {
            throw new BadRequest("Mã giảm giá đã hết hạn");
        }
        let discountAmount = 0;
        if (cou.discountType === "percent") {
            discountAmount = totalPrice * (cou.discountValue / 100);
        } else {
            discountAmount = cou.discountValue;
        }
        const totalFinal = totalPrice - discountAmount;
        return {
            discountType: cou.discountType,
            discountValue: cou.discountValue,
            discountAmount,
            totalFinal
        };
    }
    async createOrder(userId, orderData) {
        const now = new Date();
        if (!userId) {
            throw new BadRequest("Thiếu thông tin người dùng");
        }

        const { items, shippingAddress, paymentMethod = "CASH", coupon, notes } = orderData;

        if (!items || items.length === 0) {
            throw new BadRequest("Đơn hàng phải có ít nhất một sản phẩm");
        }

        if (!shippingAddress) {
            throw new BadRequest("Thiếu địa chỉ giao hàng");
        }
        const requiredFields = ["name", "phone", "address", "city", "ward"];
        const missingFields = requiredFields.filter(f => !shippingAddress[f]);
        if (missingFields.length > 0) {
            throw new BadRequest(`Thiếu thông tin giao hàng: ${missingFields.join(", ")}`);
        }
        let subtotal = 0;
        const processedItems = [];
        let coo = null;
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) {
                throw new NotFound(`Sản phẩm ${item.productId} không tồn tại`);
            }

            if (!item.quantity || item.quantity < 1) {
                throw new BadRequest("Số lượng sản phẩm phải >= 1");
            }

            let itemTotal = 0;
            let p = 0
            if (product.promotion.isActive && product.promotion.startAt <= now && product.promotion.endAt >= now) {
                p = product.promotion.discount ? product.promotion.discount : 0;
                itemTotal = (item.unitPrice * item.quantity) - (item.unitPrice * item.quantity * (product.promotion.discount ? product.promotion.discount / 100 : 0));
            } else {
                itemTotal = item.unitPrice * item.quantity;
            }
            if (coupon) {
                const cou = await couponModel.findOne({ code: coupon, isActive: true });
                coo = cou._id
                let discountAmount = 0;
                if (cou.discountType === "percent") {
                    discountAmount = itemTotal * (cou.discountValue / 100);
                } else {
                    discountAmount = cou.discountValue;
                }
                itemTotal = itemTotal - discountAmount;
            }
            subtotal += itemTotal;
            processedItems.push({
                productId: item.productId,
                sku: item.sku || "",
                name: product.name || "",
                images: product.images || [],
                type: item.type || "NONE",
                value: item.value || null,
                purity: item.purity || "",
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: itemTotal,
                discount: p,
            });
        }
        const TAX_RATE = 0.05;
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const total = subtotal + tax;
        const generateOrderCode = () => {
            const time = Date.now().toString(36).toUpperCase();
            const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
            return `ORD-${time}-${rand}`;
        };
        const emailUser = await userModel.findById(userId)
        const newOrder = await orderModel.create({
            userId,
            orderCode: generateOrderCode(),
            items: processedItems,
            shippingAddress,
            subtotal,
            tax,
            total,
            currency: "VND",
            coupon: coo || null,
            paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING",
            notes: notes || "",
            logs: [
                {
                    status: "PENDING",
                    by: userId,
                    note: "Đơn hàng được tạo",
                }
            ],
        });
        await cartModel.updateOne(
            { userId },
            { $set: { items: [] } }
        );

        return { newOrder, emailUser: emailUser.email };
    }

    async getOrderById(orderId) {
        if (!orderId) {
            throw new BadRequest("Thiếu mã đơn hàng");
        }

        const order = await orderModel
            .findById(orderId)
            .populate("userId", "name email phone")
            .populate("items.productId", "name images");

        if (!order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        return order;
    }
    async getOrdersByUserId(userId, page, limit, status) {
        console.log(status, "statusstatusstatus")
        if (!userId) {
            throw new BadRequest("Thiếu thông tin người dùng");
        }
        const filter = { userId }
        console.log(userId, page, limit, "dcmkddvnvfv")
        const skip = (page - 1) * limit;
        if (status && status !== "ALL") {
            filter.status = status
        }
        const [orders, total, allOrders] = await Promise.all([
            orderModel
                .find(filter)
                .populate("items.productId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            orderModel.countDocuments(filter),
            orderModel.find({ userId })
        ])
        console.log(allOrders, "allOrdersallOrdersallOrders")
        const totalPricePerson = allOrders.reduce((acc, order) => {
            if (order.paymentStatus === "PAID") {
                return acc + order.total;
            }
            return acc;
        }, 0);
        const totalPriceOrder = allOrders.reduce((acc, order) => {
            if (status === "ALL") return acc + order.total
            if (order.status === status) return acc + order.total
            return acc
        }, 0)
        const timeProcess =
            status === "ALL" || status === ""
                ? allOrders.length
                : allOrders.filter(o => o.status === status).length
        console.log(timeProcess, "timeProcesstimeProcesstimeProcess")
        console.log(totalPricePerson, "totalPricetotalPricetotalPricetotalPrice")
        return {
            data: orders,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            totalPricePerson,
            totalPriceOrder,
            timeProcess
        };
    }
    async getOrderByStatus(userId, status, page = 1, limit = 6) {
        if (!userId) {
            throw new BadRequest("Thiếu thông tin người dùng");
        }
        const VALID_STATUS = [
            "PENDING",
            "CONFIRMED",
            "PACKAGING",
            "SHIPPED",
            "COMPLETED",
            "CANCELLED",
        ];

        const filter = { userId };

        if (status) {
            if (!VALID_STATUS.includes(status)) {
                throw new BadRequest(`Trạng thái không hợp lệ: ${status}`);
            }
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [orders, totalItem] = await Promise.all([
            orderModel
                .find(filter)
                .populate("items.productId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            orderModel.countDocuments(filter),
        ]);

        return {
            data: orders,
            page,
            limit,
            totalItem,
            totalPage: Math.ceil(totalItem / limit),
        };
    }
    async updateOrderStatus(orderId, newStatus, adminId = null) {
        const ORDER_STATUS = {
            PENDING: "PENDING",
            CONFIRMED: "CONFIRMED",
            PACKAGING: "PACKAGING",
            SHIPPED: "SHIPPED",
            COMPLETED: "COMPLETED",
            CANCELLED: "CANCELLED",
        };

        const STATUS_FLOW = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["PACKAGING", "CANCELLED"],
            PACKAGING: ["SHIPPED"],
            SHIPPED: ["COMPLETED"],
        };
        if (!orderId) {
            throw new BadRequest("Thiếu mã đơn hàng");
        }

        if (!Object.values(ORDER_STATUS).includes(newStatus)) {
            throw new BadRequest(`Trạng thái không hợp lệ: ${newStatus}`);
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        const currentStatus = order.status;
        const allowedNextStatuses = STATUS_FLOW[currentStatus] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
            throw new BadRequest(
                `Không thể chuyển từ ${currentStatus} → ${newStatus}`
            );
        }
        order.status = newStatus;
        order.logs.push({
            status: newStatus,
            by: adminId,
            note: `Chuyển trạng thái sang ${newStatus}`,
            at: new Date(),
        });
        if (newStatus === ORDER_STATUS.SHIPPED && !order.shippedAt) {
            order.shippedAt = new Date();
        }
        return await order.save();
    }

    async updatePaymentStatus(orderId, paymentStatus) {
        if (!orderId) {
            throw new BadRequest("Thiếu mã đơn hàng");
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        order.paymentStatus = paymentStatus;
        if (paymentStatus === "PAID") {
            order.isPaid = true;
            order.paidAt = new Date();
        }
        return await order.save();
    }
    async cancelOrder(orderId, userId, reason = "") {
        if (!orderId) {
            throw new BadRequest("Thiếu mã đơn hàng");
        }
        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }
        if (order.userId.toString() !== userId) {
            throw new Unauthorized("Bạn không có quyền hủy đơn hàng này");
        }
        await this.updateOrderStatus(orderId, "CANCELLED", reason, userId);
    }
}

export default new OrderService();