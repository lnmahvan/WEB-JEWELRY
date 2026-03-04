import dayjs from 'dayjs'
import { CirclePlus, Download, RefreshCw, Search, SquarePen, Trash, X } from 'lucide-react'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BrandStore } from '@/store/brandStore/BrandStore'
import { useGetListBrand } from '@/hooks/Brand/useGetListBrand'
import { BoxProduct } from './BoxProduct/BoxProduct'
import { PaginationCustom } from '@/lib/PaginationCustom'
const BrandShema = z.object({
    name: z.string().min(1, "Thiếu tên thương hiệu")
})
export const BrandPage = () => {
    const { createBrand, updateBrand, deleteBrand } = BrandStore()
    const [brandId, setBrandId] = useState("")
    const [removeBrand, setRemoveBrand] = useState({})
    const [modelDelete, setModelDelete] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(BrandShema)
    })
    const [model, setModel] = useState(false);
    const [valuePage, setValuePage] = useState(1)
    const [keyword, setKeyword] = useState("")
    const [search, setSearch] = useState("")
    const dataFilter = {
        page: valuePage,
        limit: 10,
        search,
    }
    const { brands, isLoading, isValidating, refreshBrand } = useGetListBrand(dataFilter)
    const onSubmit = async (data) => {
        const { name } = data;
        if (brandId !== "") {
            const updateData = await updateBrand(name, brandId);
            console.log(updateData)
            setModel(false);
            await refreshBrand();
            reset()
        } else {
            const dataBrand = await createBrand(name)
            console.log(dataBrand)
            setModel(false);
            await refreshBrand();
            reset()
        }
    }
    const handleEditBrand = (item) => {
        setModel(true)
        reset({
            name: item.name
        })
        setBrandId(item._id)

    }
    const showDeleteBrand = (item) => {
        setRemoveBrand(item)
        setModelDelete(true);
    }
    const handleDeleteBrand = async (id) => {
        const deleteData = await deleteBrand(id)
        console.log(deleteData)
        setModelDelete(false);
        await refreshBrand();
    }
    const handleRefresh = async () => {
        await refreshBrand();
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
    console.log(brands, "fbnfbngmngm")
    return (
        <div className="relative min-h-screen bg-gray-50 px-4 md:px-6 py-6 shadow-md">
            {(isLoading || isValidating) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Quản lý thương hiệu</h2>
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
                            setModel(true);
                            reset({ name: "" });
                            setBrandId("");
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl
                        hover:opacity-80 active:scale-95 transition cursor-pointer">
                        <CirclePlus />
                        {/* <span>Thêm thương hiệu</span> */}
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:opacity-80 active:scale-95 transition cursor-pointer">
                        <RefreshCw />
                        {/* <span>Refresh</span> */}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {brands?.data?.brand?.map((item) => (
                    <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Slug: {item.slug}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <SquarePen
                                    onClick={() => handleEditBrand(item)}
                                    className="size-5 text-blue-500 hover:text-blue-700 hover:scale-110 transition cursor-pointer"
                                />
                                <Trash
                                    onClick={() => showDeleteBrand(item)}
                                    className="size-5 text-red-500 hover:text-red-700 hover:scale-110 transition cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 flex justify-between">
                            <span>
                                Tạo: {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                            </span>
                            <span>
                                Sửa:{" "}
                                {item.updatedAt
                                    ? dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm")
                                    : "—"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={`absolute top-1/2 left-1/2 w-105 -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-2xl shadow-2xl p-6 z-50 transition-all duration-300
                ${model
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}>
                <button
                    onClick={() => setModel(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition cursor-pointer"
                >
                    <X />
                </button>
                <h3 className="text-lg font-semibold mb-4">
                    {brandId ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Tên thương hiệu</label>
                        <input
                            {...register("name")}
                            placeholder="Nhập tên thương hiệu..."
                            className="mt-1 w-full border rounded-lg p-2.5 text-sm
                            focus:ring-2 focus:ring-primary outline-none transition focus:border-none"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setModel(false)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:opacity-80 transition cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-white rounded-lg
                            hover:opacity-80 active:scale-95 transition flex items-center justify-center cursor-pointer">
                            {isSubmitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Download />
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <PaginationCustom total={brands?.data?.totalItem} valuePage={valuePage} handleChangePage={handleChangePage} limit={10} />
            {modelDelete && (
                <BoxProduct
                    remove={removeBrand}
                    setModelDelete={setModelDelete}
                    handleDelete={handleDeleteBrand}
                />
            )}
        </div>
    );
}
