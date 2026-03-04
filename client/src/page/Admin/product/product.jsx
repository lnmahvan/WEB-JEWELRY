import { useGetListProduct } from '@/hooks/Product/useGetListProduct'
import { formatBigNumber } from '@/lib/format-big-number'
import { ProductStore } from '@/store/productStore/ProductStore'
import dayjs from 'dayjs'
import { CirclePlus, FileUp, RefreshCw, Search, SquarePen, Star, Trash } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { BoxProduct } from '../BoxProduct/BoxProduct'
import PreviewModal from './PreviewModal'
import { PaginationCustom } from '@/lib/PaginationCustom'
export const Product = () => {
    const navigate = useNavigate()
    const { deleteProduct, upFileProduct, previewUpFile } = ProductStore()
    const [modelDelete, setModelDelete] = useState(false)
    const [deletePro, setDeletePro] = useState({})
    const [showModel, setShowModel] = useState(false)
    const [dataUpTem, setDataUpTem] = useState([])
    const [uploadFile, setUploadFile] = useState(null)
    const [valuePage, setValuePage] = useState(1)
    const [keyword, setKeyword] = useState("")
    const [search, setSearch] = useState("")
    const { products, error, isLoading, isValidating, refreshProduct } = useGetListProduct({
        page: valuePage,
        limit: 2,
        search
    })
    const handleRefresh = async () => {
        await refreshProduct()
        setKeyword("")
        setSearch("")
    }
    const handleEditProduct = (id) => {
        navigate(`/admin/product-manage/products/edit/${id}`)
    }
    const showDeleteProduct = (item) => {
        setModelDelete(true)
        setDeletePro(item)
    }
    const handleDeleteProduct = async (id) => {
        const deleteItem = await deleteProduct(id)
        setModelDelete(false)
        await refreshProduct()
    }
    const handleUpload = async (e) => {
        console.log(e, "oooooooooooo")
        const file = e.target.files[0]
        console.log(file, "fileeeeee")
        if (!file) {
            return
        }
        setUploadFile(file)
        const formData = new FormData()
        formData.append("file-excel", file)
        console.log([...formData.entries()], "fvfvffbfbg")
        const dataUpPreview = await previewUpFile(formData)
        if (dataUpPreview.status === 200) {
            console.log(dataUpPreview, "dataUpPreviewdataUpPreviewdataUpPreview")
            setShowModel(true)
            setDataUpTem(dataUpPreview?.data?.data?.detailFinalProduct)
            setForm(true)
        }
    }
    const handleConfirmUpload = async () => {
        if (!uploadFile) return

        const formData = new FormData()
        formData.append("file-excel", uploadFile)
        const dataUp = await upFileProduct(formData)
        if (dataUp.status === 200) {
            setShowModel(false)
            setUploadFile(null)
            await refreshProduct()
        }
    }
    const handleChangePage = (e, value) => {
        console.log(value, "fvfjvnfjvnfj")
        setValuePage(value)
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        setSearch(keyword.trim());
    };
    console.log(dataUpTem, "dataUpPreviewdataUpPreviewdataUpPreviewdataUpPreview")
    console.log("products", products)
    return (
        <div className="relative min-h-screen bg-gray-100 px-8 py-6 shadow-md">
            <PreviewModal open={showModel} onClose={() => setShowModel(false)} data={dataUpTem} onConfirm={handleConfirmUpload} />
            {(isLoading || isValidating) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">
                    Quản lý sản phẩm
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3 w-full max-w-md"
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Nhập tên sản phẩm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium cursor-pointer"
                    >
                        <Search size={18} />
                    </button>
                </form>
                <div className="flex items-center gap-3">
                    <Link to="/admin/product-manage/products/add"
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition cursor-pointer">
                        <CirclePlus size={18} />
                        {/* Thêm sản phẩm */}
                    </Link>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition cursor-pointer">
                        <RefreshCw size={18} />
                        {/* Refresh */}
                    </button>
                    <label
                        htmlFor="fileUpload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:opacity-80"
                    >
                        <FileUp size={18} />
                        {/* Upload File */}
                    </label>

                    <input
                        id="fileUpload"
                        type="file"
                        hidden
                        onChange={handleUpload}
                    />
                </div>
            </div>
            <div className="max-w-5xl space-y-3">
                {products?.data?.data?.products?.map((item) => {
                    const mainImage =
                        item.images?.find((img) => img.isMain)?.url || item.images?.[0]?.url;
                    const firstOption = item.variants?.[0]?.options?.[0];
                    return (
                        <div
                            key={item._id}
                            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                        >
                            <div className="flex gap-4 items-center">
                                <img
                                    src={mainImage}
                                    alt={item.name}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {item.name}
                                        </h3>

                                        {item.isFeatured && (
                                            <span className="text-xs bg-yellow-400 px-2 py-0.5 rounded">
                                                Featured
                                            </span>
                                        )}

                                        {item.isNewProduct && (
                                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500">{item.slug}</p>

                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                        {item.description}
                                    </p>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {item.brandId?.name} · {item.categoryId?.name} ·{" "}
                                        {item.subCategoryId?.name}
                                    </p>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-[20px]'>
                                                {item.rating}/5
                                            </span>
                                            <Star size={16} fill="#FFD700" className='text-yellow-500' />
                                        </div>
                                        <div>
                                            Số lượt đánh giá: {item.reviewCount}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Tạo: {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <SquarePen className="text-blue-500 cursor-pointer hover:scale-110 size-5" onClick={() => handleEditProduct(item._id)} />
                                    <Trash className="text-red-500 cursor-pointer hover:scale-110 size-5" onClick={() => showDeleteProduct(item)} />
                                </div>
                            </div>
                            <div className="mt-4 space-y-4">
                                {item.variants?.map((variant) => (
                                    <div key={variant._id} className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">
                                            Màu: {variant.color}
                                        </p>

                                        {variant.options.map((opt) => {
                                            return (
                                                <div
                                                    key={opt._id}
                                                    className="flex flex-wrap items-center gap-4 text-xs bg-gray-50 border rounded-lg px-3 py-2"
                                                >
                                                    <span className="font-medium">
                                                        {opt.type === "CARAT" && `${opt.value} Carat`}
                                                        {opt.type === "GRAM" && `${opt.value} Gram`}
                                                        {opt.type === "MM" && `${opt.value} mm`}
                                                        {opt.type === "NONE" && "No size"}
                                                    </span>
                                                    {opt.purity && (
                                                        <span className="text-gray-600">
                                                            Độ tinh khiết: {opt.purity}
                                                        </span>
                                                    )}
                                                    {opt.finalPrice !== opt.originalPrice && (
                                                        <span className="line-through text-gray-400">
                                                            {formatBigNumber(opt.originalPrice, true)}
                                                        </span>
                                                    )}
                                                    <span className="text-red-600 font-semibold">
                                                        {formatBigNumber(opt.finalPrice, true)}
                                                    </span>
                                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                                        {item.promotion.isActive ? `${item.promotion.discount}%(${dayjs(item.promotion.startAt).format("DD/MM/YYYY HH:mm")}-${dayjs(item.promotion.endAt).format("DD/MM/YYYY HH:mm")})` : `${0}%`}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        Kho: {opt.stockQuantity}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        SKU: {opt.sku}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {modelDelete && <BoxProduct remove={deletePro} setModelDelete={setModelDelete} handleDelete={handleDeleteProduct} />}
            <PaginationCustom total={products?.data?.data?.totalItems} valuePage={valuePage} handleChangePage={handleChangePage} limit={2} />
        </div>
    )
}
