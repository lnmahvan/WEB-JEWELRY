import { useGetListProduct } from '@/hooks/Product/useGetListProduct'
import { formatBigNumber } from '@/lib/format-big-number'
import { Check, Heart, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useGetListSubcategory } from '@/hooks/subcategoty/useGetListSubcategory'
import { useForm } from 'react-hook-form'
import { PaginationCustom } from '@/lib/PaginationCustom'

export const FilterProduct = () => {
    const params = useParams()
    const [searchParams, setSearchParams] = useSearchParams();
    const colors = [
        { color: "xanh", label: "Blue", value: "#3366CC" },
        { color: "hồng", label: "Pink", value: "#FF33CC" },
        { color: "đỏ", label: "Red", value: "#E53935" },
        { color: "trắng", label: "White", value: "#FFFFFF" },
        { color: "đen", label: "Black", value: "#000000" },
        { color: "vàng", label: "Gold", value: "#D4AF37" },
        { color: "bạc", lablel: "Sliver", value: "#C0C0C0" }
    ];
    const [valuePage, setValuePage] = useState(1)
    const [fill, setFill] = useState({
        page: valuePage,
        limit: 6,
        subcategory: params.slug,
        search: "",
        min: "",
        max: "",
        brand: "",
        color: "",
        carat: "",
        gram: "",
        purity: "",
        mm: "",
    })
    const [value, setValue] = useState([0, 1000000]);
    const [active, setActive] = useState("")
    const [valueColor, setValueColor] = useState("")
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            search: "",
            carat: "",
            gram: "",
            purity: "",
            mm: "",
        }
    })
    const handleChange = (e) => {
        setValue(e.target.value);
    };

    console.log(params.slug, "bkbkgmbgmbkmg")
    const { products, refreshProduct, isLoading } = useGetListProduct(fill)
    console.log(products, "productsproductsproducts")
    const { subcategory } = useGetListSubcategory({
        slug: params.slug
    })
    // const handleSubmit = () => {
    //     const newFill = {
    //         ...fill,
    //         search,
    //         carat: carat ? Number(carat) : "",
    //         color: valueColor,
    //         min: value[0],
    //         max: value[1],
    //     };
    //     setFill(newFill);
    // }
    console.log(fill, "mkfbgnkgnm")
    console.log(subcategory, "subcategorysubcategory")
    const nameSubcate = subcategory?.data?.data?.subcategory[0].name
    const handleRemoveSubmit = async () => {
        reset();
        setFill({
            page: 1,
            limit: 10,
            subcategory: params.slug,
            min: "",
            max: ""
        });
        setValueColor("");
        // await refreshProduct()
    };
    const server = products?.data?.data?.serverTime
    const total = products?.data?.data?.totalItems
    console.log(products, "kbjkfbg")
    // useEffect(() => {
    //     const handleRefresh = async () => {
    //         await refreshProduct()
    //     }
    //     handleRefresh()
    // }, [])
    const onSubmit = async (data) => {
        const newFilter = {
            ...fill,
            search: data.search || "",
            carat: data.carat || "",
            purity: data.purity || "",
            gram: data.gram || "",
            mm: data.mm || "",
            min: value[0],
            max: value[1],
            color: valueColor || ""
        };

        setFill(newFilter);

        const params = {};

        Object.entries(newFilter).forEach(([key, value]) => {
            if (value !== "" && value !== undefined) {
                params[key] = value;
            }
        });
        console.log(params, "paramsparamsparamsparams")

        setSearchParams(params);
        await refreshProduct()
    };
    const handleChangePage = (e, value) => {
        setValuePage(value)
        const params = Object.fromEntries(searchParams.entries());
        params.page = value;
        setSearchParams(params);
    }
    console.log(fill, "jkmjkmkmkj")
    useEffect(() => {
        const paramsObj = Object.fromEntries(searchParams.entries());

        setFill(prev => ({
            ...prev,
            ...paramsObj,
            page: Number(paramsObj.page) || 1,
            min: paramsObj.min ? Number(paramsObj.min) : "",
            max: paramsObj.max ? Number(paramsObj.max) : ""
        }));

        if (paramsObj.min && paramsObj.max) {
            setValue([Number(paramsObj.min), Number(paramsObj.max)]);
        }

        if (paramsObj.color) {
            setValueColor(paramsObj.color);
        }

    }, []);
    return (
        <div className='px-7.5 p-16'>
            {(isLoading) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <p className='font-light text-secondary mb-4 text-[14px]'>{`Home > Collections > ${nameSubcate}`}</p>
            <div className='mb-8 flex items-center justify-between'>
                <div>
                    <h2 className='font-h3 text-primary'>{nameSubcate}</h2>
                    <p className='font-roboto text-[#1B1B1B] text-[18px]'>{total} products found</p>
                </div>
                <div>
                    <select
                        className="border-primary  border px-4 py-2 text-sm bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={active}
                        onChange={(e) => {
                            const value = e.target.value;
                            setActive(value);
                            setFill(prev => ({
                                ...prev,
                                isFeatured: value === "isFeatured" ? true : undefined,
                                isNewProduct: value === "isNewProduct" ? true : undefined,
                            }));
                        }}
                    >
                        <option value="isFeatured">Featured</option>
                        <option value="isNewProduct">New Product</option>
                    </select>
                </div>
            </div>
            <div className='flex gap-8'>
                <div className='bg-white shadow-2xl rounded-xl p-6 w-70 space-y-4'>
                    <h2>Filter Products</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <p className="text-sm font-medium mb-1">Search</p>
                            <input
                                {...register("search")}
                                placeholder="Search products..."
                                className="w-full border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">Price Range</p>
                            <Box sx={{ px: 1 }}>
                                <Slider
                                    value={value}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    step={1000000}
                                    min={0}
                                    max={10000000}
                                    sx={{
                                        color: "#C69C6D",
                                        height: 4,
                                        "& .MuiSlider-thumb": {
                                            width: 14,
                                            height: 14,
                                        },
                                    }}
                                />
                            </Box>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0đ</span>
                                <span>10tr</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Carat</p>
                            <input
                                {...register("carat")}
                                placeholder="e.g. 0.8"
                                className="w-full border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Purity</p>
                            <select
                                {...register("purity")}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value="">All</option>
                                <option value="24K">24K</option>
                                <option value="18K">18K</option>
                                <option value="14K">14K</option>
                                <option value="10K">10K</option>
                                <option value="925">Bạc 925</option>
                            </select>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Gram</p>
                            <input
                                {...register("gram")}
                                placeholder="e.g. 1.5"
                                className="w-full border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">MM</p>
                            <select
                                {...register("mm")}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value="">All</option>
                                {[4, 6, 8, 10, 12, 14, 16].map(mm => (
                                    <option key={mm}>{mm} mm</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {colors.map(ele => (
                                    <div
                                        key={ele.color}
                                        onClick={() => setValueColor(ele.color)}
                                        className={`w-8 h-8 rounded-full border cursor-pointer
                              flex items-center justify-center transition-all
                              ${valueColor === ele.color
                                                ? "ring-2 ring-primary scale-110"
                                                : "hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: ele.value }}
                                    >
                                        {valueColor === ele.color && <Check size={14} className="text-white" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                className="w-full py-2 rounded-xl bg-primary text-white
                         hover:opacity-90 transition-all cursor-pointer"
                            >
                                Lọc sản phẩm
                            </button>

                            <button
                                type="button"
                                onClick={handleRemoveSubmit}
                                className="w-full py-2 rounded-xl border border-primary text-primary cursor-pointer
                         hover:bg-primary hover:text-white transition-all"
                            >
                                Xóa lọc
                            </button>
                        </div>
                    </form>
                </div>
                {products?.data?.data?.totalItems > 0 ? (
                    <div className="grid grid-cols-3 gap-6 flex-1">
                        {products.data.data.products.map((item) => {
                            const img = item.images.find((img) => img.isMain);

                            const originalPrice = item.variants.flatMap((ele) =>
                                ele.options?.map((a) => a.originalPrice)
                            );
                            const minPrice = Math.min(
                                ...item.variants.flatMap((variant) =>
                                    variant.options.map(
                                        (opt) => opt.finalPrice ?? opt.originalPrice
                                    )
                                )
                            );
                            const date =
                                new Date(item.promotion.endAt).getTime() -
                                new Date(server).getTime();

                            return (
                                <Link to={`/product/detail/${item._id}`} key={item._id} className="px-3">
                                    <div className="p-6 bg-white rounded-2xl relative group">
                                        <div className="w-8.75 h-8.75 rounded-full bg-secondary flex items-center justify-center absolute text-white top-8.75 right-8.75 group-hover:translate-x-0 group-hover:opacity-100 translate-x-15 opacity-0 transition-all duration-500 ease-in-out">
                                            <Heart size={20} />
                                        </div>

                                        {date > 0 && (
                                            <div
                                                className={`w-10 h-10 rounded-full ${item.promotion.discount
                                                    ? "bg-secondary"
                                                    : "bg-transparent"
                                                    } flex items-center justify-center absolute text-white top-8.75 left-8.75`}
                                            >
                                                {item.promotion.discount
                                                    ? `-${item.promotion.discount}%`
                                                    : ""}
                                            </div>
                                        )}

                                        <div className="w-full h-57.25 rounded-2xl overflow-hidden">
                                            <img
                                                src={img?.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="text-center space-y-2">
                                            <div className="mt-2">
                                                <p className="text-primary">
                                                    {item?.subCategoryId?.name}
                                                </p>
                                                <p className="text-[18px] font-semibold">
                                                    {item.name}
                                                </p>
                                            </div>

                                            <div className="flex gap-3 items-center justify-center">
                                                {Array(5)
                                                    .fill(0)
                                                    .map((_, index) => (
                                                        <Star
                                                            key={index}
                                                            size={18}
                                                            color={
                                                                index < item.rating
                                                                    ? "#FFD700"
                                                                    : "#C0C0C0"
                                                            }
                                                            fill={
                                                                index < item.rating
                                                                    ? "#FFD700"
                                                                    : "#C0C0C0"
                                                            }
                                                        />
                                                    ))}
                                            </div>

                                            <div className="flex items-center gap-3 justify-center">
                                                <p>{formatBigNumber(minPrice, true)}</p>
                                                {originalPrice[0] !== minPrice && (
                                                    <p className="line-through text-gray-400">
                                                        {formatBigNumber(originalPrice[0], true)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <div className="btn py-2 hover:bg-secondary transition-all duration-500 ease-in-out cursor-pointer">
                                                    Xem chi tiết
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-gray-500">
                        Không có sản phẩm
                    </div>
                )}
            </div>
            <PaginationCustom total={products?.data?.data?.totalItems} valuePage={valuePage} handleChangePage={handleChangePage} limit={6} />
        </div >
    )
}
