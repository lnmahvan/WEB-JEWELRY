import { zodResolver } from '@hookform/resolvers/zod'
import { CirclePlus, Download, ImageUp, RefreshCw, Search, SquarePen, Trash, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { BoxProduct } from './BoxProduct/BoxProduct'
import { useGetListCategory } from '@/hooks/category/useGetListCategory'
import dayjs from 'dayjs'
import { subcategoryStore } from '@/store/subcategoryStore/subcategoryStore'
import { useGetListSubcategory } from '@/hooks/subcategoty/useGetListSubcategory'
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { RadioGroup } from '@radix-ui/react-radio-group'
import { PaginationCustom } from '@/lib/PaginationCustom'
import { useSearchParams } from 'react-router'
const SubcategorySchema = z.object({
    name: z.string().min(1, "Tên bắt buộc nhập"),
    // images: z.array(z.object({
    //     isMain: z.boolean().optional(),
    //     url: z.string()
    // })),
    description: z.string().min(1, "Chưa nhập mô tả")
})
export const SubcategoryPage = () => {
    const [valuePage, setValuePage] = useState(1)
    const [keyword, setKeyword] = useState("")
    const [search, setSearch] = useState("")
    const [searchParams, setSearchParams] = useSearchParams();
    const { categories, refreshCategory } = useGetListCategory({
        page: 1,
        limit: 10
    })
    const dataFilter = {
        page: valuePage,
        limit: 5,
        search
    }
    const { subcategory, isLoading, isValidating, refreshSubcategoty } = useGetListSubcategory(dataFilter)
    const { createSubCategory, uploadImgSub, deleteImgTem, updateSubcate, deleteSubcate } = subcategoryStore()
    console.log(subcategory, "subcategorysubcategorysubcategory")
    console.log(">>>>categories", categories)
    const [model, setModel] = useState(false)
    const [modelDelete, setModelDelete] = useState(false)
    const [selectSub, setSelectSub] = useState("")
    const [imgSubcate, setImgSubcate] = useState([]);
    const [length, setLength] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState()
    const [deleteSubCate, setDeleteSubcate] = useState({})
    const [subId, setSubId] = useState("")
    const [mainImage, setMainImage] = useState("")
    console.log(">>> selectSub", selectSub)
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(SubcategorySchema)
    })
    const onSubmit = async (data) => {
        const { name, description } = data;
        setMessage("")
        if (selectSub === "") {
            setMessage("Bạn chưa nhập danh mục")
            return
        }
        if (imgSubcate.length === 0) {
            setMessage("Bạn chưa tải ảnh lên")
            return
        }
        if (subId) {
            console.log(imgSubcate, "vmfmfkmkfmmgkhm")
            const editSub = await updateSubcate(subId, name, description, selectSub, imgSubcate)
            console.log(editSub)
            setModel(false)
            setSubId("")
            await refreshSubcategoty();
        } else {
            console.log(name, description, selectSub, imgSubcate, "smckscmskcmksmc")
            const newCate = await createSubCategory(name, description, selectSub, imgSubcate)
            console.log(newCate)
            setModel(false)
            await refreshSubcategoty();
        }
    }
    console.log(">>>> imgSSUb", imgSubcate)
    console.log(">>> subcategory", subcategory)
    const handleRefresh = async () => {
        await refreshSubcategoty()
        setKeyword("")
        setSearch("")
    }
    const handleUpload = async (e) => {
        const files = e.target.files;
        console.log(files, "filesfilesfilesfiles")
        setMessage("")
        const formData = new FormData();
        for (const file of files) {
            formData.append("subcatgory-images", file)
        }
        setLength(files.length)
        setLoading(true)
        const imgData = await uploadImgSub(formData)
        console.log(">>> imgData", imgData)
        if (imgData.status === 201) {
            setLoading(false)
            setImgSubcate((prev) => [
                ...prev,
                ...imgData?.data?.data
            ])
        } else {
            setLoading(false)
            setError("Lỗi gửi ảnh")
        }
        console.log(">>> imgsubcate", imgSubcate)
    }
    const handleMainImg = (v) => {
        console.log(v, "ddvdkkdngjngjdsngjds")
        setMainImage(v)
        setImgSubcate((prev) =>
            prev.map((i) => ({
                ...i,
                isMain: i.url === v
            }))
        )
        console.log(imgSubcate, "dnvndndvndnv")
    }
    const showDeleteSubCate = (item) => {
        setDeleteSubcate(item)
        setModelDelete(!modelDelete)
    }
    const handleUpdateSubCate = (item) => {
        setModel(true)
        reset({
            name: item.name,
            description: item.description
        })
        setSelectSub(item.categoryId._id);
        setImgSubcate(item.images)
        setSubId(item._id)
        const main = item.images.find((img) => img.isMain === true)
        console.log(main, "mianxjnsjn")
        setMainImage(main.url)
    }
    console.log("mainImddhvdbv", mainImage)
    const handleDeleteSubCate = async (id) => {
        const deleteData = await deleteSubcate(id);
        console.log(deleteData)
        setModelDelete(false)
        await refreshSubcategoty()
    }
    console.log(length, "lenght")
    const removePreview = async (url) => {
        const res = await deleteImgTem(url);
        setImgSubcate((prev) => prev.filter((item) => item.url !== url))
    }
    const handleChangePage = (e, value) => {
        setValuePage(value)
    }
    const handleSubmitCate = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        setSearch(keyword.trim());
    };
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", dataFilter.page.toString());
        params.set("limit", dataFilter.limit.toString());
        if (dataFilter.search?.trim()) {
            params.set("search", dataFilter.search.trim());
        }
        setSearchParams(params);
    }, [dataFilter.page, dataFilter.limit, dataFilter.search]);
    return (
        <div className='relative min-h-screen bg-gray-100 px-8 py-6 shadow-md'>
            {(isLoading || isValidating) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">
                    Quản lý danh mục
                </h1>
                <form
                    onSubmit={handleSubmitCate}
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
                    <button
                        onClick={() => {
                            reset({ name: "", description: "" });
                            setSelectSub("")
                            setImgSubcate([])
                            setModel(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition cursor-pointer">
                        <CirclePlus size={18} />
                        {/* Thêm danh mục */}
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition cursor-pointer">
                        <RefreshCw size={18} />
                        {/* Refresh */}
                    </button>
                </div>
            </div>
            <div className="max-w-5xl space-y-3">
                {subcategory?.data?.data?.subcategory?.map((item) => {
                    const imgMain = item.images.find((img) => img.isMain === true)
                    const imgRandom = item.images[0]
                    console.log(">> imgMain", imgMain)
                    console.log(">>> imgRandom", imgRandom)
                    return (
                        <div
                            key={item._id}
                            className="bg-white rounded-xl shadow-md px-5 py-4 flex justify-between hover:shadow-md transition"
                        >
                            <div className="pr-6 flex items-center gap-3">
                                <div>
                                    <img src={imgMain ? imgMain.url : imgRandom.url} className="w-24 h-24 object-cover rounded-xl" alt="" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        slug: {item.slug}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        Mô tả :{item.description}
                                    </p>
                                    <div className="text-xs text-gray-500 mt-3 flex gap-6">
                                        <span>
                                            Tạo: {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                                        </span>
                                        <span>
                                            Cập nhật:{" "}
                                            {item.updatedAt
                                                ? dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm")
                                                : "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <SquarePen
                                    onClick={() => handleUpdateSubCate(item)}
                                    className="size-5 text-blue-500 hover:text-blue-700 cursor-pointer transition hover:scale-110"
                                />
                                <Trash
                                    onClick={() => showDeleteSubCate(item)}
                                    className="size-5 text-red-500 hover:text-red-700 cursor-pointer transition hover:scale-110"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div
                className={`absolute top-1/2 left-1/2 w-105 -translate-x-1/2 -translate-y-1/2
                bg-white rounded-xl shadow-2xl p-6 z-50 transition-all duration-200
                ${model
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}>
                <button
                    onClick={() => setModel(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                >
                    <X />
                </button>
                <h3 className="text-lg font-semibold mb-4">
                    {subId ? "Cập nhật danh mục" : "Thêm danh mục"}
                </h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 bg-white rounded-2xl p-6 shadow-sm"
                >
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Tên danh mục
                        </label>
                        <input
                            {...register("name")}
                            placeholder="Nhập tên danh mục..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Danh mục cha
                        </label>
                        <select
                            value={selectSub}
                            onChange={(e) => setSelectSub(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">— Chọn danh mục —</option>
                            {categories?.data?.category?.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl cursor-pointer hover:opacity-90 transition w-fit">
                            <ImageUp size={18} />
                            <span className="text-sm font-medium">Upload images</span>
                            <input type="file" multiple className="hidden" onChange={handleUpload} />
                        </label>
                        <div className="mt-3">
                            {loading ? (
                                error !== "" ? (
                                    <p className="text-red-500 text-sm">{error}</p>
                                ) : (
                                    <div className="flex gap-3 flex-wrap">
                                        {Array(length).fill(1).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-24 h-24 rounded-xl bg-gray-200 animate-pulse"
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <RadioGroup onValueChange={(v) => handleMainImg(v)} value={mainImage}>
                                    <div className="flex gap-4 flex-wrap">
                                        {imgSubcate.map((item, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={item.url}
                                                    alt=""
                                                    className="w-24 h-24 object-cover rounded-xl border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePreview(item.url)}
                                                    className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <RadioGroupItem
                                                        value={item.url}
                                                        id={`main-${index}`}
                                                    />
                                                    <Label
                                                        htmlFor={`main-${index}`}
                                                        className="text-xs text-gray-600 cursor-pointer"
                                                    >
                                                        {`Ảnh ${index + 1}`}
                                                    </Label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                            {message && (
                                <p className="text-sm text-red-600 mt-2">{message}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Mô tả
                        </label>
                        <textarea
                            rows={3}
                            {...register("description")}
                            placeholder="Nhập mô tả..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary outline-none transition"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setModel(false)}
                            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Download size={18} />
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <PaginationCustom total={subcategory?.data?.data?.totalItem} valuePage={valuePage} handleChangePage={handleChangePage} limit={5} />
            {
                modelDelete && (
                    <BoxProduct
                        remove={deleteSubCate}
                        setModelDelete={setModelDelete}
                        handleDelete={handleDeleteSubCate}
                    />
                )
            }
        </div >
    )
}
