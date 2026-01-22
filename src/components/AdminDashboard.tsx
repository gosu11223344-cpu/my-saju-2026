import React, { useEffect, useMemo, useState } from "react";
import { databaseService } from "../services/databaseService";
import { ApplicationRecord } from "../types";

type AdminDashboardProps = {
  onBack: () => void;
};

type ProductKey = "premium" | "couple" | "year" | "" | string;

type MonthlyStat = {
  month: string; // YYYY-MM
  revenue: number;
  orders: number;
  products: {
    premium: { count: number; rev: number };
    couple: { count: number; rev: number }; // 인당 매출 분할(55000/2)로 집계
    year: { count: number; rev: number };
  };
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const loadData = () => {
    const allApps = databaseService.getAllApplications();
    setApps(allApps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const synced = await databaseService.syncFromRemote();
      setApps(synced || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      alert("동기화 실패");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusChange = (id: string, status: ApplicationRecord["status"]) => {
    databaseService.updateStatus(id, status);
    setApps((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("이 접수 기록을 영구 삭제하시겠습니까?")) {
      databaseService.deleteApplication(id);
      loadData();
    }
  };

  const getProductPrice = (product: ProductKey) => {
    if (product === "premium") return 29800;
    if (product === "couple") return 55000;
    if (product === "year") return 19800;
    return 0;
  };

  const calculateAppTotal = (companions: any[]) => {
    if (!companions || !Array.isArray(companions)) return 0;

    const coupleCount = companions.filter((c) => c?.product === "couple").length;
    const couplePrice = Math.ceil(coupleCount / 2) * 55000;

    const otherPrice = companions
      .filter((c) => c?.product !== "couple")
      .reduce((sum, c) => sum + getProductPrice(c?.product), 0);

    return couplePrice + otherPrice;
  };

  const totalPages = Math.max(1, Math.ceil(apps.length / itemsPerPage));

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return apps.slice(startIndex, startIndex + itemsPerPage);
  }, [apps, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthlyData: Record<string, MonthlyStat> = {};

    let totalRevenue = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let totalReportCount = 0;

    apps.forEach((app) => {
      const date = new Date(app.createdAt);
      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const companions = Array.isArray(app.companions) ? app.companions : [];
      const appRev = calculateAppTotal(companions);

      totalRevenue += appRev;
      totalReportCount += companions.length;

      if ((app.status || "pending") === "pending") pendingCount += 1;
      else paidCount += 1;

      if (!monthlyData[mKey]) {
        monthlyData[mKey] = {
          month: mKey,
          revenue: 0,
          orders: 0,
          products: {
            premium: { count: 0, rev: 0 },
            couple: { count: 0, rev: 0 },
            year: { count: 0, rev: 0 },
          },
        };
      }

      monthlyData[mKey].revenue += appRev;
      monthlyData[mKey].orders += 1;

      companions.forEach((c: any) => {
        const p = c?.product as ProductKey;
        const price = getProductPrice(p);

        if (p === "premium") {
          monthlyData[mKey].products.premium.count += 1;
          monthlyData[mKey].products.premium.rev += price;
        } else if (p === "couple") {
          monthlyData[mKey].products.couple.count += 1;
          monthlyData[mKey].products.couple.rev += 55000 / 2; // 인당 매출로 분할 집계
        } else if (p === "year") {
          monthlyData[mKey].products.year.count += 1;
          monthlyData[mKey].products.year.rev += price;
        }
      });
    });

    const sortedHistory = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));

    const emptyMonth: MonthlyStat = {
      month: currentMonthStr,
      revenue: 0,
      orders: 0,
      products: {
        premium: { count: 0, rev: 0 },
        couple: { count: 0, rev: 0 },
        year: { count: 0, rev: 0 },
      },
    };

    return {
      latestMonth: monthlyData[currentMonthStr] || emptyMonth,
      history: sortedHistory,
      totalOrders: apps.length,
      totalReportCount,
      pendingCount,
      paidCount,
      totalRevenue,
    };
  }, [apps]);

  // currentPage가 totalPages를 넘어가면 보정
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-2 sm:p-4 font-['Pretendard'] pb-20">
      <div className="max-w-[1100px] mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-[24px] shadow-sm border border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] sm:text-[24px] font-black text-slate-900 tracking-tighter">관리 대시보드</h1>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black">LIVE</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-6 bg-[#009B77] text-white rounded-xl font-black text-[13px] sm:text-[15px] shadow-md hover:brightness-110 transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              {isSyncing ? "동기화 중..." : "🔃 데이터 동기화"}
            </button>
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[13px] sm:text-[15px] shadow-sm hover:bg-slate-50 transition"
            >
              나가기
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard label="누적 주문" value={stats.totalOrders} unit="건" color="text-slate-900" />
          <StatCard label="입금 대기" value={stats.pendingCount} unit="건" color="text-[#D97706]" />
          <StatCard label="입금 완료" value={stats.paidCount} unit="건" color="text-[#2563EB]" />
          <StatCard label="누적 매출" value={(stats.totalRevenue / 10000).toFixed(1)} unit="만" color="text-[#C02128]" />
        </div>

        {/* Orders */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-5 sm:px-8 py-3 sm:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] sm:text-[18px] font-black text-slate-800">실시간 접수 상세 내역</h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                ORDER MGMT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">표시:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 rounded-md border border-slate-200 bg-white px-1 text-[11px] font-bold text-slate-600 outline-none"
              >
                {[10, 20, 30, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}개씩
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {paginatedApps.length === 0 ? (
              <div className="p-16 text-center text-slate-300 font-bold">내역이 없습니다.</div>
            ) : (
              paginatedApps.map((app) => (
                <div key={app.id} className="p-4 sm:p-6 lg:p-8 hover:bg-slate-50/40 transition-colors">
                  <div className="flex flex-col items-center mb-5 sm:mb-6">
                    <div className="text-[13px] sm:text-[16px] font-black text-slate-800">
                      {new Date(app.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      .
                    </div>
                    <div className="text-[11px] sm:text-[12px] font-bold text-slate-400">
                      {new Date(app.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    <div className="flex-1 w-full space-y-3">
  {(app.companions || []).map((c: any, i: number) => {
    const main = (app.companions || [])[0] || {};
    const payerDifferent = !!(main?.payerDifferent ?? main?.isDepositorDifferent);
    const payerName = String(main?.payerName ?? main?.depositorName ?? "").trim();

    return (
      <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-[11px] shadow-sm ${
            i === 0 ? "bg-orange-500" : "bg-slate-300"
          }`}
        >
          {i === 0 ? "M" : i + 1}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[16px] sm:text-[20px] font-black text-slate-900">{c?.name}</span>

          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black">
            {c?.gender === "male" ? "남" : "여"}
          </span>

          <span className="text-[13px] text-slate-300 font-bold">
            {c?.phone2}-{c?.phone3}
          </span>

          {/* ✅ 0번(M) 라인에서만 “타인입금” 표시 */}
          {i === 0 && payerDifferent ? (
            <span className="text-[10px] sm:text-[11px] bg-red-50 text-[#C02128] px-2 py-0.5 rounded-full font-black border border-red-200">
              입금자: {payerName || "미입력"} (타인입금)
            </span>
          ) : null}
        </div>
      </div>
    );
  })}
</div>



                    <div className="w-full lg:w-[380px] bg-[#F8FAFC] rounded-[20px] p-4 sm:p-5 border border-slate-100 shadow-inner">
                      <div className="space-y-1.5 mb-4 text-[15px] sm:text-[17px] font-bold text-slate-500 border-b border-slate-200/50 pb-3">
                        {(app.companions || []).map((c: any, i: number) => {
                          const p = c?.product as ProductKey;
                          const label =
                            p === "premium" ? "💎 프리미엄" : p === "couple" ? "💑 2인 궁합" : p === "year" ? "📅 신년운세" : "기타";
                          return (
                            <div key={i} className="flex justify-between items-center">
                              <span className="truncate pr-2">
                                {c?.name}: {label}
                              </span>
                              <span className="shrink-0 text-slate-400 tabular-nums">
                                {getProductPrice(p).toLocaleString()}원
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">TOTAL</span>
                        <div className="text-[24px] sm:text-[34px] font-black text-[#C02128] tracking-tighter leading-none">
                          {calculateAppTotal(app.companions).toLocaleString()}
                          <span className="text-[14px] ml-0.5">원</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto flex items-center justify-center gap-3">
                      <select
                        value={(app.status || "pending") as any}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                        className={`w-full sm:w-36 h-10 sm:h-12 rounded-xl font-black text-[13px] sm:text-[14px] border-2 text-center outline-none transition shadow-sm cursor-pointer ${
                          (app.status || "pending") === "pending"
                            ? "bg-[#FFFBEB] border-amber-200 text-amber-600"
                            : app.status === "paid"
                            ? "bg-[#EFF6FF] border-blue-200 text-blue-600"
                            : "bg-[#ECFDF5] border-green-200 text-green-600"
                        }`}
                      >
                        <option value="pending">입금대기</option>
                        <option value="paid">입금확인</option>
                        <option value="completed">발송완료</option>
                      </select>

                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-[11px] sm:text-[13px] text-slate-300 font-bold underline hover:text-red-500 whitespace-nowrap"
                      >
                        기록 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex justify-center items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30"
              >
                «
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p >= currentPage - 2 && p <= currentPage + 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg font-black text-[12px] border transition-all ${
                        currentPage === p
                          ? "bg-[#C02128] text-white border-[#C02128]"
                          : "bg-white text-slate-400 border-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30"
              >
                »
              </button>
            </div>
          )}
        </div>

        {/* Monthly detail */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] sm:text-[18px] font-black text-slate-800">월별 상세 매출 현황</h3>
              <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">AUTO 집계</span>
            </div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">MONTHLY LOG</span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.history.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-300 font-bold">집계 데이터가 없습니다.</div>
              ) : (
                stats.history.map((m) => (
                  <div
                    key={m.month}
                    className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col shadow-sm hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[16px] sm:text-[18px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {m.month}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">총 {m.orders}건 신청</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <MonthlyProductRow label="💎 프리미엄" count={m.products.premium.count} rev={m.products.premium.rev} />
                      <MonthlyProductRow label="💑 2인 궁합" count={m.products.couple.count} rev={m.products.couple.rev} />
                      <MonthlyProductRow label="📅 신년운세" count={m.products.year.count} rev={m.products.year.rev} />
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400">TOTAL REV.</span>
                      <div className="text-[22px] sm:text-[26px] font-black text-[#C02128] tracking-tighter leading-none">
                        {m.revenue.toLocaleString()}
                        <span className="text-[12px] ml-0.5">원</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[15px] sm:text-[18px] font-black text-slate-800">최근 월 매출 현황</h3>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">LATEST</span>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#F8FAFC] rounded-[20px] p-6 text-center border border-slate-100">
                <div className="text-[18px] sm:text-[22px] font-black text-[#1e293b] mb-1">{stats.latestMonth.month}</div>
                <div className="text-[#C02128] text-[32px] sm:text-[48px] font-black tracking-tighter leading-none">
                  <span className="text-xl sm:text-2xl mr-1">₩</span>
                  {stats.latestMonth.revenue.toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-slate-400 mt-2">{stats.latestMonth.orders}건 접수</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ReportMiniStat icon="💎" count={stats.latestMonth.products.premium.count} rev={stats.latestMonth.products.premium.rev} />
                <ReportMiniStat icon="💑" count={stats.latestMonth.products.couple.count} rev={stats.latestMonth.products.couple.rev} />
                <ReportMiniStat icon="📅" count={stats.latestMonth.products.year.count} rev={stats.latestMonth.products.year.rev} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[15px] sm:text-[18px] font-black text-slate-800">년별 매출 현황</h3>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">YEARLY</span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="bg-[#1e293b] rounded-[24px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-white text-[18px] sm:text-[24px] font-black mb-1">2026 전체</div>
                  <div className="text-white/30 text-[11px] font-bold mb-6">총 {stats.totalOrders}건 접수</div>

                  <div className="text-[#FFD966] text-[36px] sm:text-[56px] font-black tracking-tighter leading-none mb-10 text-right">
                    <span className="text-xl sm:text-3xl mr-1">₩</span>
                    {stats.totalRevenue.toLocaleString()}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <DarkMiniStat count={stats.latestMonth.products.premium.count} rev={stats.latestMonth.products.premium.rev} />
                    <DarkMiniStat count={stats.latestMonth.products.couple.count} rev={stats.latestMonth.products.couple.rev} />
                    <DarkMiniStat count={stats.latestMonth.products.year.count} rev={stats.latestMonth.products.year.rev} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#1e293b] rounded-[32px] sm:rounded-[48px] p-8 sm:p-14 shadow-2xl text-center space-y-10">
          <div className="space-y-3">
            <h2 className="text-white text-[24px] sm:text-[36px] font-black tracking-tighter">데이터 통합 요약</h2>
            <p className="text-white/30 text-[13px] sm:text-[16px] font-bold max-w-lg mx-auto break-keep leading-relaxed opacity-80">
              누적된 모든 신청 정보를 기반으로 정산된 결과입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            <SummaryBar label="누적 주문 건수" value={`${stats.totalOrders}건`} color="text-white" />
            <SummaryBar label="판매 리포트 수" value={`${stats.totalReportCount}건`} color="text-[#4A90E2]" />
            <SummaryBar label="누적 총 매출" value={`₩ ${(stats.totalRevenue / 10000).toFixed(1)}만`} color="text-[#FFD966]" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Sub components */
const StatCard = ({ label, value, unit, color }: { label: string; value: number | string; unit: string; color: string }) => (
  <div className="bg-white rounded-[18px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center sm:items-start gap-1 hover:shadow-md transition-all">
    <span className="text-slate-400 font-black text-[10px] sm:text-[12px] tracking-tight">{label}</span>
    <div className={`${color} text-[20px] sm:text-[32px] font-black tracking-tighter leading-none`}>
      {typeof value === "number" ? value.toLocaleString() : value}
      <span className="text-[12px] sm:text-[14px] font-bold text-slate-300 ml-1">{unit}</span>
    </div>
  </div>
);

const MonthlyProductRow = ({ label, count, rev }: { label: string; count: number; rev: number }) => (
  <div className="flex justify-between items-center text-[11px] sm:text-[13px]">
    <span className="text-slate-500 font-bold">
      {label} ({count}건)
    </span>
    <span className="text-slate-700 font-black tabular-nums">₩{rev.toLocaleString()}</span>
  </div>
);

const ReportMiniStat = ({ icon, count, rev }: { icon: string; count: number; rev: number }) => (
  <div className="bg-white border border-slate-100 rounded-[16px] p-3 flex flex-col items-center text-center shadow-sm">
    <span className="text-xs mb-1.5">{icon}</span>
    <div className="text-[16px] sm:text-[20px] font-black text-slate-800 mb-0.5">{count}건</div>
    <div className="text-[10px] sm:text-[11px] font-black text-[#C02128]">₩{rev.toLocaleString()}</div>
  </div>
);

const DarkMiniStat = ({ count, rev }: { count: number; rev: number }) => (
  <div className="bg-white/5 border border-white/10 rounded-[16px] p-3 flex flex-col items-center text-center backdrop-blur-sm">
    <div className="text-[16px] sm:text-[20px] font-black text-white mb-0.5">{count}건</div>
    <div className="text-[10px] sm:text-[11px] font-black text-[#FFD966]">₩{rev.toLocaleString()}</div>
  </div>
);

const SummaryBar = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.08] transition-all">
    <span className="text-white/30 font-black text-[10px] sm:text-[12px] uppercase tracking-[0.2em]">{label}</span>
    <div className={`text-[24px] sm:text-[40px] font-black tracking-tighter leading-none ${color}`}>{value}</div>
  </div>
);

export default AdminDashboard;
