import React, { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import ReviewCarousel from "./components/ReviewCarousel";
import ConsultationForm from "./components/ConsultationForm";
import PremiumReportSection from "./components/PremiumReportSection";

import LiveStatus from "./components/LiveStatus";
import Promotion from "./components/Promotion";
import AdminDashboard from "./components/AdminDashboard";
import SummaryDashboard from "./components/SummaryDashboard";
import TrustBanner from "./components/TrustBanner";

// ---- 고정 상수 (컴포넌트 밖) ----
const START_DATE_MS = new Date("2026-01-01").getTime();

function calcDynamicBaseCount(_nowMs: number) {
  const START_COUNT = 13797;
  // ✅ Applications Total은 "결정론적 40/일"만으로 올린다.
  // ✅ base에서 날짜별 자동 증가/로컬 저장/기기별 누적을 모두 제거.
  return START_COUNT;
}

/** ==============================
 * ✅ Applications: 하루 40개 "결정론적" 스케줄
 * - 어떤 기기에서 봐도 동일
 * - 타이머 bump 없이 시간 계산으로만 표시
 * ============================== */
const APP_BASE_DATE_MS = new Date("2026-01-01T00:00:00+09:00").getTime();
const DAILY_TARGET = 40;

// dayIndex별 일정 생성용(결정론)
function appRand01(seed: number) {
  const x = (seed * 9301 + 49297) % 233280;
  return x / 233280;
}

function buildAppScheduleMs(dayIndex: number) {
  const times: number[] = [];
  for (let i = 0; i < DAILY_TARGET; i++) {
    const seed = dayIndex * 1000 + i * 17 + 33;
    const t = Math.floor(appRand01(seed) * 24 * 60 * 60 * 1000);
    times.push(t);
  }
  times.sort((a, b) => a - b);

  // 최소 간격(너무 몰리지 않게)
  const MIN_GAP = 10 * 60 * 1000; // 10분
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] < MIN_GAP) {
      times[i] = Math.min(times[i - 1] + MIN_GAP, 24 * 60 * 60 * 1000 - 1);
    }
  }
  return times;
}

function calcAppCount(nowMs: number) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor((nowMs - APP_BASE_DATE_MS) / DAY_MS));

  let total = 0;
  for (let d = 0; d < days; d++) total += DAILY_TARGET; // 지난날은 40씩 확정

  // 오늘은 "지나간 스케줄만"
  const dayStart = APP_BASE_DATE_MS + days * DAY_MS;
  const msIntoDay = Math.max(0, nowMs - dayStart);
  const schedule = buildAppScheduleMs(days);
  total += schedule.filter((t) => t <= msIntoDay).length;

  return total;
}

// ==============================
// ✅ 후기 카운트: 하루 6~12개가 "오늘도 시간에 따라" 올라가게
// ✅ (새로고침해도 동일하게 보이도록 결정론적 스케줄)
// ==============================
const REVIEW_BASE_DATE_MS = new Date("2026-01-19T00:00:00+09:00").getTime();
const REVIEW_BASE_COUNT = 3500;

// dayIndex(0,1,2...)별 6~12개
function reviewDailyAdd(dayIndex: number) {
  const x = (dayIndex * 9301 + 49297) % 233280;
  return 6 + (x % 7); // 6~12
}

// 결정론 RNG(0~1)
function reviewRand01(seed: number) {
  const x = (seed * 9301 + 49297) % 233280;
  return x / 233280;
}

// 하루 안에서 "후기 +1이 일어나는 시각(ms)" 생성
function buildReviewScheduleMs(dayIndex: number) {
  const n = reviewDailyAdd(dayIndex);

  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = dayIndex * 1000 + i * 17 + 9;
    const t = Math.floor(reviewRand01(seed) * 24 * 60 * 60 * 1000); // 0~24h
    times.push(t);
  }
  times.sort((a, b) => a - b);

  // 너무 붙어있는 경우: 최소 2시간 느낌 유지
  const MIN_GAP = 2 * 60 * 60 * 1000; // 2h
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] < MIN_GAP) {
      times[i] = Math.min(times[i - 1] + MIN_GAP, 24 * 60 * 60 * 1000 - 1);
    }
  }
  return times;
}

type ReviewDayStat = {
  date: string; // YYYY-MM-DD
  count: number; // 그 날짜의 후기 수
};

function calcReviewStats(nowMs: number): ReviewDayStat[] {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor((nowMs - REVIEW_BASE_DATE_MS) / DAY_MS));

  const stats: ReviewDayStat[] = [];

  for (let d = 0; d <= days; d++) {
    const dayStart = REVIEW_BASE_DATE_MS + d * DAY_MS;
    const dateObj = new Date(dayStart);

    const dateStr = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

    let count = reviewDailyAdd(d);

    // 오늘은 "이미 지난 스케줄만"
    if (d === days) {
      const msIntoDay = Math.max(0, nowMs - dayStart);
      const schedule = buildReviewScheduleMs(d);
      count = schedule.filter((t) => t <= msIntoDay).length;
    }

    stats.push({ date: dateStr, count });
  }

  return stats;
}

// ✅ 1단계: App 화면 단계 타입
type AppStep = "form" | "result";

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>("form");

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewDayStat[]>([]);

  const getBaseAppCount = (now: number) => {
    // ✅ 시작값 + (2026-01-01부터 누적 40/일 결정론 증가)
    return calcDynamicBaseCount(now) + calcAppCount(now);
  };

  const [appCount, setAppCount] = useState(() => getBaseAppCount(Date.now()));

  const [reviewCount, setReviewCount] = useState(() => {
    const stats = calcReviewStats(Date.now());
    const baseTotal = REVIEW_BASE_COUNT + stats.reduce((s, d) => s + d.count, 0);
    return baseTotal;
  });

  // ✅ 30초마다 base 재계산(시간 흐름 반영) — 타이머 bump 없음(전 기기 동일)
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const baseReviewStats = calcReviewStats(nowTick);
    setReviewStats(baseReviewStats);

    const baseReviewTotal =
      REVIEW_BASE_COUNT + baseReviewStats.reduce((sum, d) => sum + d.count, 0);

    // ✅ 모든 기기 동일(결정론)
    setAppCount(getBaseAppCount(nowTick));
    setReviewCount(baseReviewTotal);

    // ✅ isUpdating은 "잠깐 반짝" 효과만 (원하면 제거 가능)
    setIsUpdating(true);
    const t = setTimeout(() => setIsUpdating(false), 700);
    return () => clearTimeout(t);
  }, [nowTick]);

  const handleSimulatedUpdate = useCallback(() => {
    // ✅ 숫자 변경 없음 (전 기기 동일 유지)
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("admin")) {
      setShowLoginModal(true);
    }

    const handleScroll = () => {
      setShowFloatingCta(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSecretClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    if (newCount >= 5) {
      setShowLoginModal(true);
      setAdminClickCount(0);
    }

    setTimeout(() => setAdminClickCount(0), 3000);
  };

  const handleComplete = () => {
    setError(null);
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setError(null);
    setStep("form");
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (adminPassword === "kona2018**") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPassword("");
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const scrollToForm = () => {
    const section = document.getElementById("self-input-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  if (isAdmin) {
    return <AdminDashboard onBack={() => setIsAdmin(false)} />;
  }

  return (
    <Layout>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center fixed top-4 left-1/2 -translate-x-1/2 z-[100] shadow-xl w-[90%] max-w-md">
          {error}
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#1a1a1a] border-2 border-[#FFD966]/30 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD966] to-transparent opacity-50"></div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#FFD966]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD966]/20">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-[#FFD966] text-xl font-black tracking-tighter">
                OmySaju 운영 관리자
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
                Admin Authorization
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                autoFocus
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold text-center focus:outline-none focus:border-[#FFD966] transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setAdminPassword("");
                  }}
                  className="h-14 rounded-2xl bg-white/5 text-slate-400 font-black hover:bg-white/10 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="h-14 rounded-2xl bg-[#C02128] text-white font-black hover:brightness-110 transition-all shadow-lg"
                >
                  접속하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "form" ? (
        <>
          <Promotion />
          <TrustBanner />

          <SummaryDashboard
            reviewCount={reviewCount}
            appCount={appCount}
            isUpdating={isUpdating}
          />

          <div className="px-4 pt-2 sm:pt-4 pb-2 space-y-3 sm:space-y-4">
            <ReviewCarousel reviewCount={reviewCount} reviewStats={reviewStats} />

            <ConsultationForm onComplete={handleComplete} isLoading={false} />
          </div>

          {/* ✅ LiveStatus는 pb 영향 없게 분리 + 아래 여백 최소화 */}
          <div className="px-4 pb-0 -mb-6">
            <LiveStatus
              cumulativeCount={appCount}
              reviewCount={reviewCount}
              onUpdate={handleSimulatedUpdate}
            />
          </div>

          {showFloatingCta && (
            <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[95%] max-w-2xl animate-in slide-in-from-bottom-full duration-700">
              <div className="bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-[40px] sm:rounded-full p-2.5 sm:p-3.5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-row items-center justify-between">
                <div className="flex flex-1 items-center justify-around px-2 sm:px-6 border-r border-white/10 h-16 sm:h-20">
                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[#C02128] text-[9px] sm:text-[11px] font-black uppercase tracking-tighter">
                        46% OFF
                      </span>
                      <span className="text-slate-500 text-[9px] sm:text-[11px] font-bold line-through opacity-70">
                        55,000원
                      </span>
                    </div>
                    <div className="text-white text-[18px] sm:text-[28px] font-black tracking-tighter flex items-center">
                      <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">
                        ₩
                      </span>
                      29,800
                      <span className="ml-1 text-slate-400 text-[9px] sm:text-[11px] font-bold opacity-80">
                        (1인)
                      </span>
                    </div>
                  </div>

                  <div className="w-[1px] h-8 bg-white/5"></div>

                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[#4A90E2] text-[9px] sm:text-[11px] font-black uppercase tracking-tighter">
                        50% OFF
                      </span>
                      <span className="text-slate-500 text-[9px] sm:text-[11px] font-bold line-through opacity-70">
                        110,000원
                      </span>
                    </div>
                    <div className="text-white text-[18px] sm:text-[28px] font-black tracking-tighter flex items-center">
                      <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">
                        ₩
                      </span>
                      55,000
                      <span className="ml-1 text-[#4A90E2] text-[9px] sm:text-[11px] font-bold">
                        (2인+궁합)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center relative min-w-[130px] sm:min-w-[200px]">
                  <button
                    onClick={scrollToForm}
                    className="w-full h-16 sm:h-20 bg-[#C02128] text-white rounded-[24px] sm:rounded-full font-black text-[15px] sm:text-[24px] hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(192,33,40,0.5)] tracking-tighter flex flex-col items-center justify-center leading-[1.1] sm:ml-3"
                  >
                    <div className="flex flex-col items-center">
                      <span>지금 바로</span>
                      <span>신청하기</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ 진짜 페이지 맨 마지막: 프리미엄 리포트 구성 */}
          <div className="px-4 pb-12">
            <PremiumReportSection />
          </div>

          {/* ✅ 하단 여백 */}
          <div className="h-2" />

          {/* ✅ (맨 아래로 이동) 5번 클릭 관리자 진입 트리거 */}
          <div className="w-full pb-16 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
            <p
              onClick={handleSecretClick}
              className="text-[10px] text-slate-600 font-bold cursor-default select-none text-center"
            >
              © 2026 OmySaju Lab Myeong-ri Service. All rights reserved.
              <br />
              본 서비스는 정통 명리학 데이터를 활용한 분석 결과로 참고용으로만 활용하시기 바랍니다.
            </p>
          </div>
        </>
      ) : (
        <div className="min-h-screen w-full bg-[#02040a] flex flex-col items-center justify-center text-center px-4 py-20 animate-in fade-in duration-1000 relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#f0fff4] text-[#10b981] rounded-full flex items-center justify-center text-4xl sm:text-6xl mb-12 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            ✓
          </div>
          <div className="space-y-4 mb-16">
            <h2 className="text-[28px] sm:text-[44px] font-black text-slate-500 tracking-tighter uppercase mb-4 opacity-50">
              모든 접수가
            </h2>
            <h1 className="text-[42px] sm:text-[84px] font-black text-[#C02128] mb-8 tracking-tighter leading-none">
              완료되었습니다!
            </h1>
            <div className="space-y-4 max-w-3xl">
              <p className="text-slate-400 text-[17px] sm:text-[28px] font-bold leading-relaxed tracking-tight">
                성함과 입력된 정보를 기반으로 정밀 분석이 시작되었습니다.
                <br />
                <span className="text-slate-100 font-black">120페이지 분량의 프리미엄 인생 분석서</span>는
                <br />
                입금 확인 후 <span className="text-[#C02128] font-black">최대 6~12시간 이내</span>에
                <br />
                입력하신 연락처(카카오톡/이메일)로 PDF 전송됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-16 py-6 bg-[#1e293b] text-white rounded-full font-black text-[20px] sm:text-[32px] hover:bg-slate-800 transition shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform active:scale-95 tracking-tighter"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}
    </Layout>
  );
};

export default App;
