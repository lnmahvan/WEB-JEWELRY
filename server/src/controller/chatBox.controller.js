import { parseIntent } from "../AI/parseIntent.js";
import aiModel from "../models/ai.model.js";
import categoryModel from "../models/category.model.js";
import couponModel from "../models/coupon.model.js";
import gemstoneModel from "../models/gemstone.model.js";
import materialModel from "../models/material.model.js";
import productModel from "../models/product.model.js";
import subcategoryModel from "../models/subcategory.model.js";
import aiService from "../services/ai.service.js";
import BaseController from "./base.controller.js";
class chatBoxController extends BaseController {
    getAllMessage = async (req, res) => {
        try {
            const limit = Number(req.query?.limit) || 10
            const userId = req.user.id
            const cursor = req.query.cursor
            console.log('BE cursor nhận được:', cursor)
            const data = await aiService.getAllMessage(limit, userId, cursor)
            return this.ok(res, data, "Thành công")
        } catch (error) {
            return this.handleErr(res, error)
        }
    }
    chatBox = async (req, res) => {
        try {
            const { message } = req.body;
            const userId = req.user.id;

            if (!message || !userId) {
                return res.status(400).json({ message: "Message or userId missing" });
            }
            const intentData = await parseIntent(message);
            if (!intentData || !intentData.intent) {
                return res.json({
                    answer: "Mình chưa hiểu rõ câu hỏi, bạn nói lại giúp mình nhé",
                });
            }
            console.log(intentData, "intentDataintentData")
            await aiService.createMessage({
                userId,
                role: "user",
                message,
                intent: intentData.intent,
                entities: intentData.entities,
            });

            let response;
            switch (intentData.intent) {
                case "GREETING":
                    response = { answer: "Chào bạn! Mình có thể giúp gì?" };
                    break;

                case "ASK_SHIPPING":
                    response = { answer: "Shop giao hàng từ 2–4 ngày" };
                    break;

                case "ASK_PAYMENT":
                    response = {
                        answer: "Shop hỗ trợ chuyển khoản và thanh toán khi nhận hàng",
                    };
                    break;
                case "ASK_MATERIAL_PRICE": {
                    const { category, material } = intentData.entities;
                    let answer = "";

                    const text = `${category ?? ""} ${material ?? ""}`.toLowerCase();

                    const askMetal = /vàng|bạc|kim loại/.test(text);
                    const askGem = /kim cương|đá|ngọc|ruby/.test(text);
                    if (!text.trim()) {
                        const metals = await materialModel.find({ active: true });
                        const gems = await gemstoneModel.find({ active: true });

                        if (metals.length) {
                            answer += "Giá kim loại hiện tại:\n";
                            answer += metals.map(m => {
                                const purity = m.purity ? ` (${m.purity})` : "";
                                return `${m.name}${purity}: ${m.pricePerUnit.toLocaleString()} đ / ${m.unit.toLowerCase()}`;
                            }).join("\n");
                            answer += "\n\n";
                        }

                        if (gems.length) {
                            answer += "Giá đá quý hiện tại:\n";
                            answer += gems.map(g =>
                                `• ${g.name}: ${g.pricePerUnit.toLocaleString()} đ / ${g.unit.toLowerCase()}`
                            ).join("\n");
                        }

                        response = { answer };
                        break;
                    }
                    if (askMetal) {
                        const metals = await materialModel.find({ active: true });

                        answer = "Giá kim loại hiện tại:\n" + metals.map(m => {
                            const purity = m.purity ? ` (${m.purity})` : "";
                            return `${m.name}${purity}: ${m.pricePerUnit.toLocaleString()} đ / ${m.unit.toLowerCase()}`;
                        }).join("\n");

                        response = { answer };
                        break;
                    }
                    if (askGem) {
                        const gems = await gemstoneModel.find({ active: true });

                        answer = "Giá đá quý hiện tại:\n" + gems.map(g =>
                            `${g.name}: ${g.pricePerUnit.toLocaleString()} đ / ${g.unit.toLowerCase()}`
                        ).join("\n");

                        response = { answer };
                        break;
                    }

                    response = {
                        answer: "Hiện tại shop chưa có thông tin giá vật liệu này",
                    };
                    break;
                }
                case "ASK_CATEGORY": {
                    const categories = await categoryModel.find();
                    if (!categories.length) {
                        response = { answer: "Hiện tại shop chưa có danh mục sản phẩm." };
                        break;
                    }

                    const answer =
                        "Shop hiện có các danh mục sau:\n" +
                        categories.map(c => `${c.name}`).join("\n");

                    response = { answer };
                    break;
                }
                case "ASK_SUBCATEGORY": {
                    const { category } = intentData.entities;

                    if (!category) {
                        response = {
                            answer: "Bạn muốn xem danh mục con của loại trang sức nào?"
                        };
                        break;
                    }

                    const parentCategory = await categoryModel.findOne({
                        name: { $regex: category, $options: "i" }
                    });

                    if (!parentCategory) {
                        response = { answer: "Shop không tìm thấy danh mục này." };
                        break;
                    }

                    const subcategories = await subcategoryModel.find({
                        categoryId: parentCategory._id,
                        active: true
                    });

                    if (!subcategories.length) {
                        response = {
                            answer: `Danh mục ${parentCategory.name} hiện chưa có loại con.`
                        };
                        break;
                    }

                    const answer =
                        `Các loại thuộc ${parentCategory.name} gồm:\n` +
                        subcategories.map(s => `${s.name}`).join("\n");

                    response = { answer };
                    break;
                }
                case "SEARCH_PRODUCT": {
                    const { category, material, priceMax } = intentData.entities;
                    const pipeline = [];
                    pipeline.push({
                        $lookup: {
                            from: "categories", // bảng muốn join
                            localField: "categoryId",  // field bên products
                            foreignField: "_id", // field bên categories
                            as: "category"  // tên field mới sau khi join
                        }
                    });
                    pipeline.push({ $unwind: "$category" }); // Biến mảng thành object
                    if (category) {
                        pipeline.push({
                            $match: {
                                "category.name": { $regex: category, $options: "i" }
                            }
                        });
                    }
                    if (material) {
                        pipeline.push({
                            $match: {
                                "variants.options.purity": { $regex: material, $options: "i" }
                            }
                        });
                    }
                    if (priceMax) {
                        pipeline.push({
                            $match: {
                                "variants.options.finalPrice": { $lte: priceMax }
                            }
                        });
                    }
                    pipeline.push({ $limit: 5 });
                    const products = await productModel.aggregate(pipeline);
                    response = products.length
                        ? {
                            answer: `Mình tìm được ${products.length} sản phẩm phù hợp`,
                            products,
                        }
                        : {
                            answer: "Hiện tại shop chưa có sản phẩm phù hợp",
                            products: [],
                        };

                    break;
                }
                default:
                    response = {
                        answer: "Mình chưa hiểu rõ, bạn nói chi tiết hơn giúp mình nha",
                    };
            }
            await aiService.createMessage({
                userId,
                role: "assistant",
                message: response.answer,
                intent: intentData.intent,
                entities: intentData.entities,
                products: (response.products || []).map(p => ({
                    _id: p._id,
                    name: p.name,
                    slug: p.slug,
                    images: p.images || [],
                    promotion: {
                        isActive: p.promotion?.isActive ?? false,
                        discount: p.promotion?.discount ?? 0
                    }
                }))
            });
            return res.json(response);
        } catch (err) {
            console.error("CHATBOX ERROR >>>", err);
            return res.status(500).json({ message: "Server error" });
        }
    }
}
export default new chatBoxController();