import React from 'react'
import { Route, Routes } from 'react-router'
import SignupPage from '@/page/Account/signup/SignupPage'
import LoginPage from '@/page/Account/login/LoginPage'
import { Collections } from '@/page/Account/Collections/Collections'
import { FilterProduct } from '@/page/Account/Collections/FilterProduct'
import { DetailProduct } from '@/page/Account/DetailProduct/DetailProduct'
import { Cart } from '@/page/Account/Cart/Cart'
import { CustomerChat } from '@/page/Account/CustomerChat/CustomerChat'
import { Compare } from '@/page/Account/Compare/Compare'
import { About } from '@/page/Account/About/About'
import { Home } from '@/page/Account/Home/Home'
import { LayoutAccount } from '@/layout/LayoutAccount/LayoutAccount'
import { Checkout } from '@/page/Account/Checkout/Checkout'
import PaymentFailed from '@/page/Account/Payment/PaymentFailed'
import { PaymentSuccess } from '@/page/Account/Payment/PaymentSuccess'
import { PaymentSuccessCustom } from "@/page/Account/Payment/PaymentSuccessCustom"
import { PaymentList } from '@/page/Account/Payment/PaymentList'
import { Profile } from '@/page/Account/Profile/Profile'
import { Personal } from '@/page/Account/Profile/Personal'
import { OrderList } from '@/page/Account/Profile/OrderList'
import { WishList } from '@/page/Account/Profile/WishList'
import { WishListPage } from '@/page/Account/Wish/WishListPage'
import { JewelryType } from '@/page/Account/Custom/JewelryType'
import { InfomationPage } from '@/page/Account/Custom/InfomationPage'
import { Custom } from '@/page/Account/Custom/Custom'
import { Preview3DPage } from '@/page/Account/Custom/Preview3D'
import { DesignPage } from '@/page/Account/Custom/DesignPage'
import { DesignRequire } from '@/page/Account/Profile/DesignRequire'
import { SaleItemList } from '@/page/Account/SaleItem/SaleItemList'
import PaymentCancel from '@/page/Account/Payment/PaymentCancel'

export const RouterAccount = () => {
    return (
        <Routes>
            <Route path='/' element={<LayoutAccount />}>
                <Route path='sign-up' element={<SignupPage />} />
                <Route path='login' element={<LoginPage />} />
                <Route path='collections' element={<Collections />} />
                <Route path='collections/:slug' element={<FilterProduct />} />
                <Route path='compare' element={<Compare />} />
                <Route path='sale' element={<SaleItemList />} />
                <Route path='product/detail/:id' element={<DetailProduct />} />
                <Route path='cart' element={<Cart />} />
                <Route path='chat-customer' element={<CustomerChat />} />
                <Route path='about' element={<About />} />
                <Route path='custom' element={<Custom />}>
                    <Route index element={<JewelryType />} />
                    <Route path='infomation' element={<InfomationPage />} />
                    <Route path='design' element={<DesignPage />} />
                </Route>
                <Route index element={<Home />} />
                <Route path="order/checkout" element={<Checkout />} />
                <Route path='/payment/cancel/custom' element={<PaymentFailed />} />
                <Route path='/payment/cancel' element={<PaymentCancel />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path='/payment/success/custom' element={<PaymentSuccessCustom />} />
                <Route path='/wish' element={<WishListPage />} />
                <Route path='/account' element={<Profile />}>
                    <Route index element={<Personal />} />
                    <Route path='order' element={<OrderList />} />
                    <Route path='wish' element={<WishList />} />
                    <Route path='design' element={<DesignRequire />} />
                </Route>
            </Route>
        </Routes>
    )
}
