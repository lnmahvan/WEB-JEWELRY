import { useEffect, useState } from 'react'
import { CirclePlus, Download, RefreshCw, Search, SquarePen, Trash, X } from 'lucide-react';
import dayjs from "dayjs"
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BoxProduct } from './BoxProduct/BoxProduct';
import { useSearchParams } from 'react-router';
import { CategoryStore } from '@/store/categoryStore/CategoryStore';
import { useGetListCategory } from '@/hooks/category/useGetListCategory';
import { PaginationCustom } from '@/lib/PaginationCustom';
const CategorySchema = z.object({
    name: z.string().min(1, "Thiếu tên danh mục"),
    description: z.string().min(1, "Thiếu mô tả danh mục")
})
export const CategoryPage = () => {
    const [valuePage, setValuePage] = useState(1)
    const [keyword, setKeyword] = useState("")
    const [search, setSearch] = useState("")
    const dataFilter = {
        page: valuePage,
        limit: 5,
        search,
    }
    const { categories, isLoading, isValidating, refreshCategory } = useGetListCategory(dataFilter);
    console.log("categories", categories)
    const { createCategory, updateCategory, deleteCategory } = CategoryStore()
    const [model, setModel] = useState(false);
    const [cateId, setCateId] = useState("")
    const [deleteCate, setDeleteCate] = useState({})
    const [modelDelete, setModelDelete] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(CategorySchema)
    })
    const onSubmit = async (data) => {
        try {
            const { name, description } = data;
            if (cateId !== "") {
                const updateData = await updateCategory(name, description, cateId)
                console.log(">>> updateData", updateData);
                setModel(false);
                reset();
                await refreshCategory()
                setCateId("")
            } else {
                const newData = await createCategory(name, description);
                console.log(">>> newData", newData);
                setModel(false);
                reset();
                await refreshCategory()
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleUpdateCate = (item) => {
        setModel(true);
        reset({
            name: item.name,
            description: item.description
        });
        setCateId(item._id)
    }
    const showDeleteCate = async (item) => {
        setDeleteCate(item)
        setModelDelete(!modelDelete)
    }
    const handleDeleteCate = async (id) => {
        const deleteData = await deleteCategory(id)
        console.log(deleteData)
        setModelDelete(false);
        await refreshCategory()
    }
    const handleRefresh = async () => {
        await refreshCategory()
        setKeyword("")
        setSearch("")
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
        <div className="relative min-h-screen bg-gray-100 px-8 py-6 shadow-md">
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
                            setCateId("");
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
                {categories?.data?.category?.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white rounded-xl shadow-md px-5 py-4 flex justify-between hover:shadow-md transition">
                        <div className="pr-6">
                            <h3 className="text-base font-semibold text-gray-800">
                                {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                slug: {item.slug}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {item.description}
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
                        <div className="flex gap-3 pt-1">
                            <SquarePen
                                onClick={() => handleUpdateCate(item)}
                                className="size-5 text-blue-500 hover:text-blue-700 cursor-pointer transition hover:scale-110"
                            />
                            <Trash
                                onClick={() => showDeleteCate(item)}
                                className="size-5 text-red-500 hover:text-red-700 cursor-pointer transition hover:scale-110"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={`fixed top-1/2 left-1/2 w-105 -translate-x-1/2 -translate-y-1/2
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
                    {cateId ? "Cập nhật danh mục" : "Thêm danh mục"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Tên danh mục</label>
                        <input
                            {...register("name")}
                            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm
                            focus:ring-2 focus:ring-primary outline-none"/>
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <textarea
                            rows={3}
                            {...register("description")}
                            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none
              focus:ring-2 focus:ring-primary outline-none"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setModel(false)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:opacity-80 transition"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-white rounded-lg
              hover:opacity-80 transition flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Download />
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <PaginationCustom total={categories?.data?.totalItem} valuePage={valuePage} handleChangePage={handleChangePage} limit={10} />
            {modelDelete && (
                <BoxProduct
                    remove={deleteCate}
                    setModelDelete={setModelDelete}
                    handleDelete={handleDeleteCate}
                />
            )}
        </div>
    );
}
