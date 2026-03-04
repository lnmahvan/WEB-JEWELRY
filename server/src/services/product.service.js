import { BadRequest, Conflict, NotFound } from "../core/error.response.js";
import { toSlug } from "../libs/toSlug.js";
import productModel from "../models/product.model.js";
import brandModel from "../models/brand.model.js";
import categoryModel from "../models/category.model.js";
import subcategoryModel from "../models/subcategory.model.js";
import reviewModel from "../models/review.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../config/configCloudDinary.js";
import { getPublicId } from "../libs/publicId.js";
import materialModel from "../models/material.model.js";
import gemstoneModel from "../models/gemstone.model.js";
import XLSX from "xlsx";
import fs from "fs";
import { error } from "console";
class ProductService {
    async getAllProduct(page, limit, search, minPrice, maxPrice, color, carat, gram, purity, mm, categoryName, subCategoryName, brandName, isNewProduct, isFeatured) {
        const skip = (page - 1) * limit;
        const query = {
            $and: []
        };
        query.$and.push({ "variants.options.finalPrice": { $gte: minPrice, $lte: maxPrice } })
        if (color) {
            query.$and.push({
                "variants.color": { $regex: color, $options: "i" }
            })
        }
        if (isNewProduct) {
            query.$and.push({
                isNewProduct: JSON.parse(isNewProduct)
            })
        }
        if (isFeatured) {
            query.$and.push({
                isFeatured: JSON.parse(isFeatured)
            })
        }
        if (carat) {
            query.$and.push({ "variants.options": { $elemMatch: { type: "CARAT", value: carat } } });
        }
        if (gram) {
            query.$and.push({ "variants.options": { $elemMatch: { type: "GRAM", value: gram } } });
        }
        if (purity) {
            query.$and.push({ "variants.options": { $elemMatch: { type: "GRAM", purity: purity } } });
        }
        if (mm) {
            query.$and.push({ "variants.options": { $elemMatch: { type: "MM", value: mm } } });
        }
        if (search) query.$and.push({ name: { $regex: search, $options: "i" } });
        const [category, subcategory, brand] = await Promise.all([
            categoryName ? categoryModel.findOne({ slug: { $regex: categoryName, $options: "i" } }) : null,
            subCategoryName ? subcategoryModel.findOne({ slug: { $regex: subCategoryName, $options: "i" } }) : null,
            brandName ? brandModel.findOne({ slug: { $regex: brandName, $options: "i" } }) : null,
        ]);
        if (category) query.$and.push({ categoryId: category._id });
        if (subcategory) query.$and.push({ subCategoryId: subcategory._id });
        if (brand) query.$and.push({ brandId: brand._id });
        const [products, totalItems] = await Promise.all([
            productModel
                .find(query)
                .populate("brandId")
                .populate("categoryId")
                .populate("subCategoryId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            productModel.countDocuments(query)
        ]);
        const now = new Date();
        const normalProducts = await Promise.all(
            products.map(async (product) => {
                const [reviews, reviewCount] = await Promise.all([
                    reviewModel
                        .find({ productId: product._id })
                        .populate("userId")
                        .populate("productId"),
                    reviewModel.countDocuments({ productId: product._id })
                ]);
                if (reviewCount > 0) {
                    const total = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount;
                    product.rating = Number(total.toFixed(1));
                    product.reviewCount = reviewCount;
                } else {
                    product.rating = 0;
                    product.reviewCount = 0;
                }
                if (
                    product.promotion?.isActive &&
                    product.promotion.endAt &&
                    new Date(product.promotion.endAt) <= now
                ) {
                    product.promotion.isActive = false;
                    product.promotion.discount = 0;

                    product.variants.forEach(variant => {
                        variant.options.forEach(option => {
                            option.finalPrice = option.originalPrice;
                        });
                    });
                }
                product.variants.forEach(variant => {
                    if (variant.options.length > 1) {

                        const totalOriginal = variant.options.reduce(
                            (sum, op) => sum + (op.originalPrice || 0), 0
                        );

                        const totalFinal = variant.options.reduce(
                            (sum, op) => sum + (op.finalPrice || 0), 0
                        );

                        const mergedType = variant.options.map(op => op.type).join("+");
                        const mergedValue = variant.options.map(op => op.value).join("+");
                        const totalQuantity = variant.options.reduce((acc, total) => acc + total.stockQuantity, 0)
                        variant.options = [{
                            sku: variant.options[0].sku,
                            type: mergedType,
                            value: mergedValue,
                            originalPrice: totalOriginal,
                            finalPrice: totalFinal,
                            stockQuantity: totalQuantity,
                        }];
                    }
                });
                return product;
            })
        );
        const totalPages = Math.ceil(totalItems / limit)
        return {
            currentPage: page,
            totalItems,
            totalPages,
            limit,
            serverTime: now.toISOString(),
            products: normalProducts,
        };
    }
    async getOntime(isActive, page, limit) {
        const skip = (page - 1) * limit;
        const now = new Date()
        const hasActiveSale = !!(await productModel.exists({
            "promotion.isActive": true,
            "promotion.startAt": { $lte: now },
            "promotion.endAt": { $gt: now },
        }));
        console.log(">>> hasActiveSale", hasActiveSale)
        if (!hasActiveSale) {
            return {
                currentPage: page,
                totalItems: 0,
                products: [],
                serverTime: now.toISOString(),
                hasActiveSale,
            };
        }
        const query = isActive
            ? {
                "promotion.isActive": true,
                "promotion.startAt": { $lte: now },
                "promotion.endAt": { $gt: now },
            }
            : {};
        const [products, totalItems] = await Promise.all([
            productModel
                .find(query)
                .sort({ createdAt: -1 })
                .sort({ "promotion.discount": -1 })
                .skip(skip)
                .limit(limit),
            productModel.countDocuments(query),
        ]);
        return {
            currentPage: page,
            totalItems,
            products,
            serverTime: now.toISOString(),
            hasActiveSale
        }

    }
    async getProductById(id) {
        if (!id) {
            throw new BadRequest("Thiếu thông tin");
        }
        const data = await productModel.findById(id).populate("brandId")
            .populate("categoryId")
            .populate("subCategoryId").lean();
        const now = new Date();
        if (
            data.promotion?.isActive &&
            data.promotion.endAt &&
            new Date(data.promotion.endAt) <= now
        ) {
            data.promotion.isActive = false;
            data.promotion.discount = 0;
            data.variants.forEach(variant => {
                variant.options.forEach(option => {
                    option.finalPrice = option.originalPrice;
                });
            });
        }
        data.variants.forEach(variant => {
            if (variant.options.length > 1) {
                const totalOriginal = variant.options.reduce(
                    (sum, op) => sum + (op.originalPrice || 0), 0
                );
                const totalFinal = variant.options.reduce(
                    (sum, op) => sum + (op.finalPrice || 0), 0
                );
                const mergedType = variant.options.map(op => op.type).join("+");
                const mergedValue = variant.options.map(op => op.value).join("+");
                console.log(mergedType, "mergedTypemergedTypemergedType")
                console.log(mergedValue, "mergedValuemergedValuemergedValue")
                variant.options = [{
                    sku: variant.options[0].sku,
                    type: mergedType,
                    value: mergedValue,
                    originalPrice: totalOriginal,
                    finalPrice: totalFinal,
                    stockQuantity: Math.min(...variant.options.map(o => o.stockQuantity)),
                }];
            }
        });
        return data;
    }
    async getProductByIdToEdit(id) {
        if (!id) {
            throw new BadRequest("Thiếu thông tin");
        }
        const data = await productModel.findById(id).populate("brandId")
            .populate("categoryId")
            .populate("subCategoryId").lean();
        const now = new Date();
        if (
            data.promotion?.isActive &&
            data.promotion.endAt &&
            new Date(data.promotion.endAt) <= now
        ) {
            data.promotion.isActive = false;
            data.promotion.discount = 0;
            data.variants.forEach(variant => {
                variant.options.forEach(option => {
                    option.finalPrice = option.originalPrice;
                });
            });
        }
        return data;
    }
    async createProduct(data) {
        const { name, brandId, categoryId, subCategoryId, promotion, variants, images, description, isFeatured, isNewProduct } = data;

        if (!name || !brandId || !categoryId || !subCategoryId)
            throw new BadRequest("Thiếu thông tin");

        const slug = toSlug(name);

        const [existSlug, existBrand, existCategory, existSub] = await Promise.all([
            productModel.findOne({ slug }),
            brandModel.findById(brandId),
            categoryModel.findById(categoryId),
            subcategoryModel.findById(subCategoryId)
        ]);

        if (existSlug) throw new Conflict("Sản phẩm đã tồn tại");
        if (!existBrand) throw new NotFound("Không tìm thấy thương hiệu");
        if (!existCategory) throw new NotFound("Không tìm thấy danh mục");
        if (!existSub) throw new NotFound("Không tìm thấy danh mục phụ");

        if (!Array.isArray(variants) || variants.length === 0) {
            throw new BadRequest("Phải có ít nhất 1 variant");
        }
        if (!Array.isArray(images) || images.length === 0) {
            throw new BadRequest("Phải có ít nhất 1 ảnh");
        }
        if (!images.some(img => img.isMain)) {
            images[0].isMain = true;
        }
        console.log(variants, ">>>variants")

        const generateSku = [];
        for (const variant of variants) {
            const newVariant = {
                color: variant.color,
                options: []
            };
            for (const op of variant.options) {
                const material = await materialModel.findById(op.itemId);
                const gem = await gemstoneModel.findById(op.itemId)
                const pricePerUnit = material?.pricePerUnit ? material?.pricePerUnit : gem?.pricePerUnit;

                newVariant.options.push({
                    ...op,
                    sku: `${toSlug(name).toUpperCase().slice(0, 3)}-${variant.color ? variant.color.toUpperCase().slice(0, 2) : "NO"
                        }-${String(op.value).replace('.', '')}-${nanoid(6).toUpperCase()}`,
                    originalPrice: pricePerUnit * op.value,
                    finalPrice:
                        promotion.isActive ? pricePerUnit * op.value - (pricePerUnit * op.value * promotion.discount / 100) : pricePerUnit * op.value
                });
            }
            generateSku.push(newVariant);
        }
        let updatedPromotion = promotion;
        if (promotion?.isActive) {
            const start = new Date(promotion.startAt)
            const end = new Date(promotion.endAt);
            if (end <= start) {
                throw new BadRequest("Thời gian khuyến mãi không hợp lệ");
            }
            const diffMs = end.getTime() - start.getTime();
            const durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
            const durationDays = Math.ceil(durationHours / 24);
            updatedPromotion = { ...updatedPromotion, durationHours, durationDays }
        }
        const newProduct = await productModel.create({
            slug,
            name,
            brandId,
            categoryId,
            subCategoryId,
            promotion: updatedPromotion,
            variants: generateSku,
            images,
            description,
            isFeatured: isFeatured || false,
            isNewProduct: isNewProduct || false,
            rating: 0,
            reviewCount: 0,
        });
        return newProduct
    }
    async upFileProduct(filePath) {
        if (!filePath) {
            throw new BadRequest("Thiếu file")
        }
        try {
            const workbook = XLSX.readFile(filePath, { cellDates: true });
            const sheetNames = workbook.SheetNames;
            const parseArray = (value) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                return value
                    .replace(/[\[\]]/g, "") // "vàng,bạc,kim cương"
                    .split(",") // ["vàng", "bạc", "kim cương"]
                    .map(v => v.trim()); // ["vàng", "bạc", "kim cương"]
            };
            const parseExcelDate = (value) => {
                if (!value) return null; // trường hợp ô trống
                if (value instanceof Date) return value; // nếu đã là Date object
                if (typeof value === "number") {
                    return new Date(Math.round((value - 25569) * 86400 * 1000)); // Excel date number
                }
                if (typeof value === "string") {
                    if (value.includes("/")) {
                        const [day, month, year] = value.split("/").map(Number); // định dạng dd/mm/yyyy
                        return new Date(year, month - 1, day); // tháng trong Date là 0-indexed
                    }
                    return new Date(value); // thử parse trực tiếp nếu là chuỗi khác
                }
                return null;
            };
            let productMap = {}
            for (let i = 0; i < sheetNames.length; i++) {
                const firstSheet = workbook.Sheets[sheetNames[i]];
                const rawRows = XLSX.utils.sheet_to_json(firstSheet);
                console.log(rawRows, "rawRowsrawRowsrawRows")
                rawRows.forEach((row) => {
                    const { name, brandId, categoryId, subCategoryId, description, isFeatured, isNewProduct, promotion_isActive, promotion_discount, promotion_startAt, promotion_endAt, color, itemId, type, value, purity, stockQuantity, url, isMain } = row;
                    console.log(name, brandId, categoryId, subCategoryId, description, isFeatured, isNewProduct, promotion_isActive, promotion_discount, promotion_startAt, promotion_endAt, color, itemId, type, value, purity, stockQuantity, url, isMain, "dataexxel")
                    if (!productMap[name]) {
                        productMap[name] = {
                            name,
                            brandId,
                            categoryId,
                            subCategoryId,
                            description,
                            isFeatured,
                            isNewProduct,
                            promotion: {},
                            images: [],
                            variants: []
                        };
                    }
                    const product = productMap[name];
                    if (promotion_isActive) {
                        product.promotion = {
                            isActive: promotion_isActive,
                            discount: Number(promotion_discount),
                            startAt: parseExcelDate(promotion_startAt),
                            endAt: parseExcelDate(promotion_endAt)
                        }
                    } else {
                        product.promotion = {
                            isActive: promotion_isActive,
                            discount: 0,
                            startAt: null,
                            endAt: null
                        }
                    }
                    const urls = parseArray(url);
                    console.log(urls, "urlsurlsurls")
                    const isMainArr = parseArray(isMain);
                    urls.forEach((u, index) => {
                        const exists = product.images.find(img => img.url === u);
                        if (!exists) {
                            product.images.push({
                                url: u,
                                isMain: String(isMainArr[index]).toLowerCase() === "true"
                            });
                        }
                    });
                    const colors = parseArray(color);
                    const itemIds = parseArray(itemId);
                    const types = parseArray(type);
                    const values = parseArray(value);
                    const purities = parseArray(purity);
                    if (colors.length === 1) {
                        const c = colors[0];

                        let existVariant = product.variants.find(v => v.color === c);
                        if (!existVariant) {
                            existVariant = { color: c, options: [] };
                            product.variants.push(existVariant);
                        }

                        itemIds.forEach((id, index) => {
                            existVariant.options.push({
                                itemId: id,
                                type: types[index],
                                value: Number(values[index]),
                                purity: purities[index],
                                stockQuantity: Number(stockQuantity)
                            });
                        });
                    }
                    else if (colors.length === itemIds.length) {
                        colors.forEach((c, index) => {
                            let existVariant = product.variants.find(v => v.color === c);
                            if (!existVariant) {
                                existVariant = { color: c, options: [] };
                                product.variants.push(existVariant);
                            }
                            existVariant.options.push({
                                itemId: itemIds[index],
                                type: types[index],
                                value: Number(values[index]),
                                purity: purities[index],
                                stockQuantity: Number(stockQuantity)
                            });
                        });
                    }
                    else {
                        throw new BadRequest(
                            `Color (${colors.length}) và itemId (${itemIds.length}) không khớp ở product ${name}`
                        );
                    }
                    console.log(product, "productproductproductproduct")
                })
            }
            const finalProducts = Object.values(productMap);
            await Promise.all(
                finalProducts.map(item => this.createProduct(item))
            );
            return {
                totalProducts: finalProducts.length
            };
        } catch (err) {
            throw err
        } finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
    async previewUpFileProduct(filePath) {
        if (!filePath) {
            throw new BadRequest("Thiếu file")
        }
        try {
            const workbook = XLSX.readFile(filePath, { cellDates: true });
            const sheetNames = workbook.SheetNames;
            const parseArray = (value) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                return value
                    .replace(/[\[\]]/g, "")
                    .split(",")
                    .map(v => v.trim());
            };
            const parseExcelDate = (value) => {
                if (!value) return null;
                if (value instanceof Date) return value;
                if (typeof value === "number") {
                    return new Date(Math.round((value - 25569) * 86400 * 1000));
                }
                if (typeof value === "string") {
                    if (value.includes("/")) {
                        const [month, day, year] = value.split("/").map(Number);
                        return new Date(year, month - 1, day);
                    }
                    return new Date(value);
                }
                return null;
            };
            let productMap = {}
            for (let i = 0; i < sheetNames.length; i++) {
                const firstSheet = workbook.Sheets[sheetNames[i]];
                const rawRows = XLSX.utils.sheet_to_json(firstSheet);
                console.log(rawRows, "rawRowsrawRowsrawRows")
                rawRows.forEach((row) => {
                    const { name, brandId, categoryId, subCategoryId, description, isFeatured, isNewProduct, promotion_isActive, promotion_discount, promotion_startAt, promotion_endAt, color, itemId, type, value, purity, stockQuantity, url, isMain } = row;
                    console.log(name, brandId, categoryId, subCategoryId, description, isFeatured, isNewProduct, promotion_isActive, promotion_discount, promotion_startAt, promotion_endAt, color, itemId, type, value, purity, stockQuantity, url, isMain, "dataexxel")
                    if (!productMap[name]) {
                        productMap[name] = {
                            name,
                            brandId,
                            categoryId,
                            subCategoryId,
                            description,
                            isFeatured,
                            isNewProduct,
                            promotion: {},
                            images: [],
                            variants: []
                        };
                    }
                    const product = productMap[name];
                    if (promotion_isActive) {
                        product.promotion = {
                            isActive: promotion_isActive,
                            discount: Number(promotion_discount),
                            startAt: parseExcelDate(promotion_startAt),
                            endAt: parseExcelDate(promotion_endAt)
                        }
                    } else {
                        product.promotion = {
                            isActive: promotion_isActive,
                            discount: 0,
                            startAt: null,
                            endAt: null
                        }
                    }
                    const urls = parseArray(url);
                    console.log(urls, "urlsurlsurls")
                    const isMainArr = parseArray(isMain);
                    urls.forEach((u, index) => {
                        const exists = product.images.find(img => img.url === u);
                        if (!exists) {
                            product.images.push({
                                url: u,
                                isMain: String(isMainArr[index]).toLowerCase() === "true"
                            });
                        }
                    });
                    const colors = parseArray(color);
                    const itemIds = parseArray(itemId);
                    const types = parseArray(type);
                    const values = parseArray(value);
                    const purities = parseArray(purity);
                    if (colors.length === 1) {
                        const c = colors[0];

                        let existVariant = product.variants.find(v => v.color === c);
                        if (!existVariant) {
                            existVariant = { color: c, options: [] };
                            product.variants.push(existVariant);
                        }

                        itemIds.forEach((id, index) => {
                            existVariant.options.push({
                                itemId: id,
                                type: types[index],
                                value: Number(values[index]),
                                purity: purities[index],
                                stockQuantity: Number(stockQuantity)
                            });
                        });
                    }
                    else if (colors.length === itemIds.length) {
                        colors.forEach((c, index) => {
                            let existVariant = product.variants.find(v => v.color === c);
                            if (!existVariant) {
                                existVariant = { color: c, options: [] };
                                product.variants.push(existVariant);
                            }
                            existVariant.options.push({
                                itemId: itemIds[index],
                                type: types[index],
                                value: Number(values[index]),
                                purity: purities[index],
                                stockQuantity: Number(stockQuantity)
                            });
                        });
                    }
                    else {
                        throw new BadRequest(
                            `Color (${colors.length}) và itemId (${itemIds.length}) không khớp ở product ${name}`
                        );
                    }
                    console.log(product, "productproductproductproduct")
                })
            }
            const finalProducts = Object.values(productMap);
            const brandIds = [...new Set(finalProducts.map((br) => br.brandId))]
            const categoryIds = [...new Set(finalProducts.map((ca) => ca.categoryId))]
            const subCategoryIds = [...new Set(finalProducts.map((sub) => sub.subCategoryId))];
            const itemIds = [...new Set(
                finalProducts.flatMap((o) => o.variants.flatMap((v) =>
                    v.options.flatMap((p) =>
                        p.itemId
                    ))))]
            const [brands, categories, subCategories, materials, gemStores] = await Promise.all([
                brandModel.find({ _id: { $in: brandIds } }).lean(),
                categoryModel.find({ _id: { $in: categoryIds } }).lean(),
                subcategoryModel.find({ _id: { $in: subCategoryIds } }).lean(),
                materialModel.find({ _id: { $in: itemIds } }).lean(),
                gemstoneModel.find({ _id: { $in: itemIds } }).lean()
            ])
            const brandMap = Object.fromEntries(brands.map((br) => [br._id.toString(), br]));
            const categoryMap = Object.fromEntries(categories.map((cate) => [cate._id.toString(), cate]))
            const subCategoryMap = Object.fromEntries(subCategories.map((sub) => [sub._id.toString(), sub]))
            const materialMap = Object.fromEntries(materials.map((ma) => [ma._id.toString(), ma]))
            const gemStoreMap = Object.fromEntries(gemStores.map((gem) => [gem._id.toString(), gem]))
            finalProducts.forEach((fi) => {
                fi.brandId = brandMap[fi.brandId] || null
                fi.categoryId = categoryMap[fi.categoryId] || null
                fi.subCategoryId = subCategoryMap[fi.subCategoryId] || null
                fi.variants.forEach((va) => {
                    va.options.forEach((op) => {
                        materialMap[op.itemId] ? op.itemId = materialMap[op.itemId] : op.itemId = gemStoreMap[op.itemId]
                    })
                })
            })
            return {
                totalProducts: finalProducts.length,
                detailFinalProduct: finalProducts
            };
        } catch (err) {
            throw err
        } finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
    async updateProduct(id, data) {
        const { name, brandId, categoryId, subCategoryId, promotion, variants, images, description, isFeatured, isNewProduct } = data;

        const product = await productModel.findById(id);
        if (!product) throw new NotFound("Không tìm thấy sản phẩm");

        const [existBrand, existCategory, existSub] = await Promise.all([
            brandModel.findById(brandId),
            categoryModel.findById(categoryId),
            subcategoryModel.findById(subCategoryId),
        ]);

        if (!existBrand) throw new NotFound("Không tìm thấy thương hiệu");
        if (!existCategory) throw new NotFound("Không tìm thấy danh mục");
        if (!existSub) throw new NotFound("Không tìm thấy danh mục phụ");

        if (!Array.isArray(variants) || variants.length === 0)
            throw new BadRequest("Phải có ít nhất 1 variant");

        if (!Array.isArray(images) || images.length === 0)
            throw new BadRequest("Phải có ít nhất 1 ảnh");

        const generateSku = [];
        for (const variant of variants) {
            const newVariant = {
                color: variant.color,
                options: []
            };
            for (const op of variant.options) {
                console.log(op, "opopopopopop")
                let existingOption = null;

                if (variant._id && op._id) {
                    const oldVariant = product.variants.find(
                        (va) => va._id.toString() === variant._id
                    );

                    if (oldVariant) {
                        existingOption = oldVariant.options.find(
                            (sk) => sk._id.toString() === op._id
                        );
                    }
                }
                const material = await materialModel.findById(op.itemId);
                const gemStone = await gemstoneModel.findById(op.itemId)
                // console.log(material, "materialmaterial")
                const pricePerUnit = material ? material?.pricePerUnit ?? 0 : gemStone?.pricePerUnit ?? 0;
                // console.log(pricePerUnit, "pricePerUnitpricePerUnit")
                // console.log(op, "kbkgbgmkbgm")
                newVariant.options.push({
                    ...op,
                    sku: existingOption
                        ? existingOption.sku
                        : `${toSlug(name || product.name)
                            .toUpperCase()
                            .slice(0, 3)}-${variant.color?.toUpperCase().slice(0, 2) || "NO"
                        }-${String(op.value).replace('.', '')}-${nanoid(6).toUpperCase()}`,
                    originalPrice: pricePerUnit * op.value,
                    finalPrice:
                        promotion.isActive ? pricePerUnit * op.value - (pricePerUnit * op.value * promotion.discount / 100) : pricePerUnit * op.value
                });
            }
            generateSku.push(newVariant);
        }
        let updatedPromotion = promotion;
        if (promotion?.isActive) {
            const start = new Date(promotion.startAt)
            const end = new Date(promotion.endAt);
            if (end <= start) {
                throw new BadRequest("Thời gian khuyến mãi không hợp lệ");
            }
            const diffMs = end.getTime() - start.getTime();
            const durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
            const durationDays = Math.ceil(durationHours / 24);
            updatedPromotion = { ...updatedPromotion, durationHours, durationDays }
        }
        const mergedImg = [...images, ...product.images].filter(
            (v, i, arr) => arr.findIndex(t => t.url === v.url) === i
        );
        console.log(">>> mergedImg", mergedImg)
        const newSlug = name ? toSlug(name) : product.slug;
        return await productModel.findByIdAndUpdate(
            id,
            {
                slug: newSlug,
                name,
                brandId,
                categoryId,
                subCategoryId,
                promotion: updatedPromotion,
                variants: generateSku,
                images: mergedImg,
                description,
                isFeatured: isFeatured ?? product.isFeatured,
                isNewProduct: isNewProduct ?? product.isNewProduct,
            },
            { new: true }
        );
    }

    async deleteProduct(id) {
        const deleted = await productModel.findByIdAndDelete(id);
        if (!deleted) throw new NotFound("Không tìm thấy sản phẩm");
        return deleted;
    }
    async uploadImgProduct(files) {
        if (!files || files.length === 0) {
            throw new BadRequest("Vui lòng chọn ảnh");
        }
        const up = files.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, {
                folder: "products",
            });
            // await fs.unlink(item.path);
            return { url: result.secure_url };
        });
        const results = await Promise.all(up);
        return results;

    }
    async removeImgProduct(id, url) {
        const product = await productModel.findById(id);
        if (!product) throw new NotFound("Không tìm thấy sản phẩm");
        console.log("URL RECEIVED:", url);
        console.log("DB IMAGES BEFORE:", product.images);
        const publicId = getPublicId(url);
        product.images = product.images.filter((item) => item.url !== url);
        console.log("DB IMAGES after:", product.images);
        product.markModified("images");
        await Promise.all([
            cloudinary.uploader.destroy(publicId),
            product.save()
        ]);
        return product.images;
    }
    async removeImgTem(url) {
        if (!url) throw new BadRequest("Thiếu URL");
        const publicId = getPublicId(url);
        console.log("publicId", publicId)
        await cloudinary.uploader.destroy(publicId);
        return url
    }
    async updateRating(id) {
        const [reviews, total] = await Promise.all([
            reviewModel.find({ productId: id }),
            reviewModel.countDocuments({ productId: id }),
        ]);

        const avgRating = total === 0 ? 0 :
            parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(2));

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { rating: avgRating, reviewCount: total },
            { new: true }
        );

        if (!updatedProduct) throw new NotFound("Không tìm thấy sản phẩm");

        return {
            avgRating,
            totalReviews: total,
            product: updatedProduct,
        };
    }
}

export default new ProductService();
