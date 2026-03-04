import { BadRequest, Forbidden } from "../core/error.response.js";
import categoryModel from "../models/category.model.js";
import customModel from "../models/custom.model.js";
import gemstoneModel from "../models/gemstone.model.js";
import materialModel from "../models/material.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import subcategoryModel from "../models/subcategory.model.js";
import userModel from "../models/user.model.js";
class DashboardService {
    async getDashboard(userId, range = 7) {
        if (!userId) {
            throw new BadRequest("Vui lòng đăng nhập");
        }
        const user = await userModel.findById(userId);
        if (user.role !== "admin") throw new Forbidden("Không có quyền");
        const now = new Date();
        const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
        const startOfRange = new Date(); startOfRange.setDate(now.getDate() - range); startOfRange.setHours(0, 0, 0, 0);
        const [totalUser, totalProduct, totalCategory, totalSubcate, totalMaterial, totalGemstone, totalOrders, totalPaidCustom] = await Promise.all([
            userModel.countDocuments(),
            productModel.countDocuments(),
            categoryModel.countDocuments(),
            subcategoryModel.countDocuments(),
            materialModel.countDocuments(),
            gemstoneModel.countDocuments(),
            orderModel.countDocuments(),
            customModel.countDocuments({ paymentStatus: "PAID" })
        ]);
        const todayStats = await orderModel.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paidAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            }
        ]);
        const totalRevenueAgg = await orderModel.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" }
                }
            }
        ]);
        const totalRevenueCustomAgg = await customModel.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" }
                }
            }
        ]);
        const orderStatus = await orderModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    value: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1
                }
            }
        ]);
        const newUsersToday = await userModel.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        const revenueChart = await orderModel.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paidAt: { $gte: startOfRange }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paidAt" },
                        month: { $month: "$paidAt" },
                        day: { $dayOfMonth: "$paidAt" }
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $concat: [
                            { $toString: "$_id.day" },
                            "/",
                            { $toString: "$_id.month" }
                        ]
                    },
                    revenue: 1, // giữ lại field đó trong kết quả còn không có là 0
                    orders: 1
                }
            }
        ]);
        const hasActiveSale = !!(await productModel.exists({
            "promotion.isActive": true,
            "promotion.startAt": { $lte: now },
            "promotion.endAt": { $gt: now },
        }));
        const query =
        {
            "promotion.isActive": true,
            "promotion.startAt": { $lte: now },
            "promotion.endAt": { $gt: now },
        }
        const [products, totalProductOnTime] = await Promise.all([
            productModel
                .find(query)
                .sort({ createdAt: -1 })
                .sort({ "promotion.discount": -1 }),
            productModel.countDocuments(query),
        ]);
        console.log(products, 'productsproductsproducts')
        return {
            overview: {
                users: totalUser,
                products: totalProduct,
                categories: totalCategory,
                subcategories: totalSubcate,
                materials: totalMaterial,
                gemstones: totalGemstone,
                orders: totalOrders,
                revenue: totalRevenueAgg[0]?.revenue || 0,
                customPaid: totalPaidCustom,
                totalRevenueCustomAgg: totalRevenueCustomAgg[0].revenue || 0
            },
            productOnTime: hasActiveSale ? {
                products,
                totalProductOnTime,
                hasActiveSale
            } : {
                products: [],
                totalProductOnTime: 0,
                hasActiveSale,
            },
            today: {
                revenue: todayStats[0]?.revenue || 0,
                orders: todayStats[0]?.orders || 0,
                newUsersToday
            },

            charts: {
                revenue: revenueChart,
                orderStatus
            }
        };
    }
}
export default new DashboardService()