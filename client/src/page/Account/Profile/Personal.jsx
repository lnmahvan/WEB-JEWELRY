import { useGetListOrderByUserId } from '@/hooks/Order/useGetListOrderByUserId'
import { useGetListWish } from '@/hooks/Wish/useGetListWish'
import { formatBigNumber } from '@/lib/format-big-number'
import { UserAuthStore } from '@/store/userAuthStore'
import { CircleDollarSign, Clock, Handbag, Heart } from 'lucide-react'
import React from 'react'

export const Personal = () => {
    const { user } = UserAuthStore()
    const { orderUsers, error, isLoading, refreshOrderUsers } = useGetListOrderByUserId({
        page: 1,
        limit: 10
    })
    const { wishs, isLoading: loadingWish, refreshWish, error: errorWish } = useGetListWish({
        page: 1,
        limit: 10
    })
    console.log(orderUsers, "orderUsersorderUsers")
    console.log(user, "useruseruser")
    console.log(wishs, "wishswishswishs")
    return (
        <div className='my-16 bg-white shadow-xl rounded-xl p-8'>
            <div>
                <div className='flex justify-center'>
                    <div className='text-center space-y-6'>
                        <div className='w-30 h-30 rounded-full overflow-hidden border-3 border-primary ml-2'>
                            {user && <img src={user?.avatar} alt="avatar" className='w-full h-full object-cover' />}

                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-[20px] font-bold'>{user?.fullName}</h2>
                            <p className='text-[14px] font-light'>{user?.email}</p>
                        </div>
                        {/* <div>
                            <div className='btn inline-block rounded-xl bg-transparent border-primary border text-primary px-8.5 py-3.5'>
                                Sửa hồ sơ
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className='grid grid-cols-3 gap-6 my-12'>
                    <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                        <div className='size-10 bg-primary flex items-center justify-center text-white rounded-full'>
                            <Handbag size={20} />
                        </div>
                        <p className='text-[24px] font-bold text-primary'>{orderUsers?.data?.data?.total}</p>
                        <p className='font-medium text-[14px] text-[#4B5563]'>Tổng đơn hàng</p>
                    </div>
                    <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                        <div className='size-10 bg-secondary flex items-center justify-center text-white rounded-full'>
                            <CircleDollarSign size={20} />
                        </div>
                        <p className='text-[24px] font-bold text-primary'>{formatBigNumber(Math.ceil(orderUsers?.data?.data?.totalPricePerson), true)}</p>
                        <p className='font-medium text-[14px] text-[#4B5563]'>Tổng tiền</p>
                    </div>
                    <div className='bg-white shadow-2xl rounded-xl flex items-center justify-center flex-col p-6 space-y-2'>
                        <div className='size-10 bg-primary flex items-center justify-center text-white rounded-full'><Heart size={20} /></div>
                        <p className='text-[24px] font-bold text-primary'>{wishs?.data?.data?.totalItem}</p>
                        <p className='font-medium text-[14px] text-[#4B5563]'>Sản phẩm yêu thích</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
