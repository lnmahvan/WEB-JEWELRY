import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useGetListDashboard } from '@/hooks/Dashboard/useGetListDashboard'
import { formatBigNumber } from "@/lib/format-big-number";
import { useCountdown } from "@/hooks/CountDown/useCountDown";
import { SaleCard } from "@/page/Account/SaleItem/SaleCard";
import { SaleList } from "./SaleList";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];
export const DashboardPage = () => {
    const { dashboards, isLoading } = useGetListDashboard({ ranger: 14 });
    console.log(dashboards, "dashboardsdashboardsdashboards")
    if (isLoading || !dashboards) return <div className="p-10 text-center text-muted-foreground">Loading dashboard...</div>;

    const { overview, today, charts, productOnTime } = dashboards?.data?.data;
    console.log(overview, "overviewoverviewoverviewoverview")
    return (
        <div className="p-6 space-y-8 bg-linear-to-b from-slate-50 to-white min-h-screen">
            <div className="grid gap-2 grid-cols-4">
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-indigo-500 to-indigo-600 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Người dùng</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.users}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-emerald-500 to-emerald-600 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Sản phẩm</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.products}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-amber-500 to-orange-500 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Đơn hàng</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.orders}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-blue-500 to-cyan-500 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Doanh thu</p>
                    <div className="mt-3 flex items-end gap-2">
                        <p className="text-3xl font-semibold tabular-nums truncate">
                            {formatBigNumber(Math.ceil(overview.revenue), true)}
                        </p>
                    </div>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-purple-500 to-violet-600 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Danh mục</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.categories}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-rose-500 to-pink-500 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Vật liệu</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.materials}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-blue-500 to-cyan-500 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Đá quý</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.gemstones}
                    </p>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-lg bg-linear-to-br from-blue-500 to-cyan-500 hover:scale-[1.02] transition-all">
                    <p className="text-xs uppercase tracking-wider opacity-80">Đơn hàng yêu cầu đã thanh toán</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums truncate">
                        {overview.customPaid} - {formatBigNumber(Math.ceil(overview.totalRevenueCustomAgg), true)}
                    </p>
                </div>
            </div>
            {productOnTime?.hasActiveSale && productOnTime?.products?.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {productOnTime.products.map(product => (
                        <SaleList key={product._id} product={product} />
                    ))}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Doanh thu hôm nay</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-semibold text-blue-600">{formatBigNumber(Math.ceil(today.revenue), true)}</p></CardContent>
                </Card>
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Đơn hàng hôm nay</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-semibold text-amber-600">{today.orders}</p></CardContent>
                </Card>
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Người dùng mới hôm nay</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-semibold text-emerald-600">{today.newUsersToday}</p></CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-2xl shadow-lg border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Doanh thu trong vòng 7 ngày qua</CardTitle>
                    </CardHeader>
                    <CardContent className="h-90">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.revenue}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-lg border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Trạng thái đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="h-90 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={charts.orderStatus} dataKey="value" nameKey="name" outerRadius={120} innerRadius={70} paddingAngle={4}>
                                    {charts.orderStatus.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};