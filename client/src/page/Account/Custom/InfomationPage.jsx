
import { useGetListGemStone } from '@/hooks/GemStone/useGetListGemStone'
import { useGetListMaterial } from '@/hooks/Material/useGetListMaterial'
import { formatBigNumber } from '@/lib/format-big-number'
import { commonStore } from '@/store/commonStore/commonStore'
import { CustomStore } from '@/store/customStore/CustomStore'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Input from '@mui/material/Input'
import Slider from '@mui/material/Slider'
import React, { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import z from 'zod'
const InfomationSchema = z.object({
    size: z.coerce.number().min(5, "Size không hợp lệ").max(100, "Size không hợp lệ"),
    budget: z.coerce.number().min(5_000_000, "Ngân sách quá thấp"),
})
export const InfomationPage = () => {
    const { next, setCustomData, setNext } = commonStore()
    const navigate = useNavigate()
    console.log(next, "nextnextnextnext")
    useEffect(() => {
        if (!next) {
            navigate("/custom")
        }
    }, [next])
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(InfomationSchema)
    })
    const { materials, isLoading, refreshMaterial } = useGetListMaterial({
        page: 1,
        limit: 20
    })
    const { gemStones, refreshGemStones } = useGetListGemStone({
        page: 1,
        limit: 20
    })
    const SIZE_OPTIONS = {
        RING: [
            { label: "Size 5 (15.7mm)", value: 5 },
            { label: "Size 6 (16.5mm)", value: 6 },
            { label: "Size 7 (17.3mm)", value: 7 },
            { label: "Size 8 (18.1mm)", value: 8 },
            { label: "Size 9 (18.9mm)", value: 9 },
            { label: "Size 10 (19.8mm)", value: 10 },
        ],

        BRACELET: [
            { label: "16 cm (Nhỏ)", value: 16 },
            { label: "17 cm (Vừa)", value: 17 },
            { label: "18 cm (Tiêu chuẩn)", value: 18 },
            { label: "19 cm (To)", value: 19 },
            { label: "20 cm (Rộng)", value: 20 },
        ],

        NECKLACE: [
            { label: "40 cm (Choker)", value: 40 },
            { label: "45 cm (Princess)", value: 45 },
            { label: "50 cm (Matinee)", value: 50 },
            { label: "55 cm", value: 55 },
            { label: "60 cm", value: 60 },
        ],
        EARRING: [
            { label: "Stud nhỏ (4 mm)", value: 4 },
            { label: "Stud vừa (5 mm)", value: 5 },
            { label: "Stud lớn (6 mm)", value: 6 },
            { label: "Hoop nhỏ (12 mm)", value: 12 },
            { label: "Hoop vừa (15 mm)", value: 15 },
            { label: "Hoop lớn (20 mm)", value: 20 },
            { label: "Drop ngắn (25 mm)", value: 25 },
            { label: "Drop dài (35 mm)", value: 35 },
        ],
    }
    const { addCustom, calculateCustom } = CustomStore()
    console.log(next, "bnkgbgkbnkgnb")
    console.log(materials, "materialsmaterialsmaterials")
    console.log(gemStones, "gemStonesgemStonesgemStones")
    const [selectMaterial, setSelectMaterial] = useState("")
    const [selectGem, setSelectGem] = useState("")
    const [nextPage, setNextPage] = useState(false)
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null)
    const onSubmit = async (data) => {
        if (!selectMaterial || !selectGem) {
            toast.error("Vui lòng chọn vật liệu và đá")
            return
        }
        console.log(data, "gbgbgbgbgm")
        setLoading(true)

        try {
            const res = await calculateCustom({
                jewelryType: next === "RING" ? "Nhẫn" : next === "BRACELET" ? "Vòng tay" : next === "NECKLACE" ? "Vòng cổ" : "Bông tai",
                material: selectMaterial,
                gem: selectGem,
                size: data.size,
                budget: data.budget,
            })
            if (res.status === 200) {
                toast.success("Tính toán thành công")
                console.log(res, "fbgbgkbkgbgnbmg")
                const { gram, carat, subTotal, size, jewelryType, material, gem } = res?.data?.data
                setResult({ gram, carat, subTotal, size, jewelryType })
                setCustomData({
                    jewelryType: jewelryType,
                    size: size,
                    budget: data.budget,
                    material: material,
                    gem: gem,
                    gram,
                    carat,
                    subTotal,
                })
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        const isValid =
            !!selectMaterial &&
            !!selectGem &&
            result?.gram > 0 &&
            result?.carat > 0

        setNextPage(isValid)
    }, [
        selectMaterial,
        selectGem,
        result?.gram,
        result?.carat,
    ])
    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
            <div className="max-w-6xl mx-auto mb-12 px-4">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-primary">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <span className="font-semibold hidden sm:inline">Chọn loại</span>
                    </div>
                    <div className="w-16 h-1 bg-primary"></div>
                    <div className="flex items-center gap-2 text-primary">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                        <span className="font-semibold hidden sm:inline">Nhập thông tin</span>
                    </div>
                    <div className="w-16 h-1 bg-gray-300"></div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">3</div>
                        <span className="font-semibold hidden sm:inline">Thiết kế</span>
                    </div>
                </div>
            </div>
            <div className='text-center mb-12'>
                <h2 className='text-[28px] font-bold text-primary'>Bước 2 – Nhập tông tin</h2>
                <p className='font-light text-[14px]'>Nhập thông tin của trang sức.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <h3 className="text-xl font-semibold text-primary">
                    Phần thân (Kim loại)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chất liệu</label>
                        <select
                            onChange={(e) => setSelectMaterial(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">--- Chọn ---</option>
                            {materials?.data?.data?.material.map(i => (
                                <option key={i._id} value={i._id}>
                                    {i.name} {i.purity}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-primary">
                    Phần đầu (Đá quý)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Loại đá</label>
                        <select
                            onChange={(e) => setSelectGem(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">--- Chọn ---</option>
                            {gemStones?.data?.data?.gemstones.map(i => (
                                <option key={i._id} value={i._id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium" >Size</label>
                    <select
                        {...register("size")}
                        disabled={!selectMaterial}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    >
                        <option value="">-- Chọn size --</option>

                        {SIZE_OPTIONS[next?.toUpperCase()]?.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    {errors.size && (
                        <p className="text-red-500 text-sm">{errors.size.message}</p>
                    )}
                </div>
                <Controller
                    name="budget"
                    control={control}
                    defaultValue={5_000_000}
                    render={({ field }) => (
                        <Slider
                            {...field}
                            value={field.value}
                            onChange={(_, v) => field.onChange(v)}
                            valueLabelDisplay="auto"
                            step={1_000_000}
                            min={5_000_000}
                            max={100_000_000}
                            sx={{
                                color: "#C69C6D",
                                height: 4,
                            }}
                        />
                    )}
                />
                <p className="font-semibold text-primary">
                    Ngân sách: {formatBigNumber(useWatch({ control, name: "budget" }), true)}
                </p>
                <div>
                    <button className='btn' type='submit'>Tính toán</button>
                </div>
            </form>
            <div>
                {result && (
                    <div className="bg-gray-100 p-4 rounded">
                        <p>Loại trang sức: <b>{result.jewelryType}</b></p>
                        <p>Size: <b>{result.size}</b></p>
                        <p>Carat: <b>{result.carat} ct</b></p>
                        <p>Gram: <b>{result.gram} g</b></p>
                        <p className="text-lg font-bold text-primary">
                            Tổng: {formatBigNumber(result.subTotal, true)}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center">
                <button onClick={() => navigate("/custom")} className="btn bg-primary text-white cursor-pointer rounded-xl">
                    Quay lại
                </button>

                <button
                    disabled={!nextPage}
                    onClick={() => navigate("/custom/design")}
                    className="
          btn rounded-xl px-8
          bg-primary text-white
          disabled:bg-gray-400
          disabled:cursor-not-allowed
          cursor-pointer
        "
                >
                    Tiếp tục
                </button>
            </div>
        </div>

    )
}
