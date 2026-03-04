import { useGetListProduct } from '@/hooks/Product/useGetListProduct'
import { formatBigNumber } from '@/lib/format-big-number'
import { Heart, MoveLeft, MoveRight, Star } from 'lucide-react'
import React, { useRef } from 'react'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router'
export const BestSeller = () => {
    const { products, isLoading, isValidating, refreshProduct, error } = useGetListProduct({
        page: 1,
        limit: 6,
        isNewProduct: true,
    })
    const sliderRef = useRef()
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false
    };
    const handlePrev = () => {
        sliderRef.current.slickPrev();
    }
    const handleNext = () => {
        sliderRef.current.slickNext()
    }
    console.log(products, "fbmfmbf")
    const server = products?.data?.data?.serverTime
    return (
        <div className='my-16 mx-7.5 relative group/slider'>
            <div className='text-center'>
                <h2 className='text-[36px] font-bold'>Sản phẩm bán chạy nhất</h2>
                <p className='mb-12 text-[18px] font-light text-[#1B1B1B]'>Khám phá những sản phẩm được yêu thích nhất của chúng tôi, được chế tác tỉ mỉ và trân trọng bởi khách hàng trên toàn thế giới.</p>
                <Slider {...settings} ref={sliderRef}>
                    {products && products?.data?.data?.products.map((item) => {
                        const img = item.images.find((img) => img.isMain)
                        const originalPrice = item.variants.flatMap((ele) =>
                            ele.options?.map((a) => a.originalPrice)
                        );
                        console.log(originalPrice, "originalPriceoriginalPrice")
                        const minPrice = Math.min(
                            ...item.variants.flatMap(variant =>
                                variant.options.map(opt =>
                                    opt.finalPrice ?? opt.originalPrice
                                )
                            )
                        );
                        const date =
                            new Date(item.promotion.endAt).getTime() -
                            new Date(server).getTime();
                        console.log(minPrice, "vnfnvfbfb")
                        return (
                            <Link to={`/product/detail/${item._id}`} key={item._id} className='px-3'>
                                <div key={item._id} className='p-6 bg-white rounded-2xl relative group'>
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
                                    <div className='w-full h-57.25 rounded-2xl overflow-hidden'>
                                        <img src={img?.url} alt="" className='w-full h-full object-cover' />
                                    </div>
                                    <div className='text-center space-y-2'>
                                        <div className='mt-2'>
                                            <p className='text-primary'>{item?.subCategoryId?.name}</p>
                                            <p className='text-[18px] font-semibold'>{item.name}</p>
                                        </div>
                                        <div className='flex gap-3 items-center justify-center'>
                                            {Array(5).fill(0).map((_, index) => (
                                                <Star key={index} size={18} color={index < item.rating ? "#FFD700" : "#C0C0C0"} fill={index < item.rating ? "#FFD700" : "#C0C0C0"}>
                                                </Star>
                                            ))}
                                        </div>
                                        <div className='flex items-center gap-3 justify-center'>
                                            <p>{formatBigNumber(minPrice, true)}</p>
                                            {originalPrice[0] !== minPrice ? <p className='line-through text-gray-400'>{formatBigNumber(originalPrice[0], true)}</p> : ""}
                                        </div>
                                        <div >
                                            <div className='btn py-2 hover:bg-secondary transition-all duration-500 ease-in-out cursor-pointer'>
                                                Xem chi tiết
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </Slider>
            </div>
            <div
                onClick={handlePrev}
                className="absolute top-1/2 left-6  -translate-y-1/2 w-11.25 h-11.25 bg-white rounded-full flex items-center justify-center hover:bg-title cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all"
            >
                <MoveLeft className="size-6" />
            </div>

            <div
                onClick={handleNext}
                className="absolute top-1/2 right-6 -translate-y-1/2 w-11.25 h-11.25 bg-white rounded-full flex items-center justify-center hover:bg-title cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all"
            >
                <MoveRight className="size-6" />
            </div>
        </div>
    )
}
