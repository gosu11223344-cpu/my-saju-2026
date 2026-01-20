import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Layout from "./components/Layout";
import ReviewCarousel from "./components/ReviewCarousel";
import ConsultationForm from "./components/ConsultationForm";
import LiveStatus from "./components/LiveStatus";
import Promotion from "./components/Promotion";
import AdminDashboard from "./components/AdminDashboard";
import SummaryDashboard from "./components/SummaryDashboard";
import TrustBanner from "./components/TrustBanner";
import { databaseService } from "./services/databaseService";

// ---- 고정 상수 (컴포넌트 밖) ----
const START_DATE_MS = new Date("2026-01-01").getTime();

function calcDynamicBaseCount(nowMs: number) {
  const START_COUNT = 13797;
  const diffDays = Math.floor((nowMs - START_DATE_MS) / (1000 * 60 * 60 * 24));
  const dailyGrowth = diffDays * 38;
  return START_COUNT + dailyGrowth;
}

function calcInitialReviewCount(nowMs: number) {
  const diffDays = Math.floor((nowMs - START_DATE_MS) / (1000 * 60 * 60 * 24));
  const baseReviews = 1825;
  const dailyGrowth = diffDays * 5;
  return baseReviews + dailyGrowth;
}

const App: React.FC = () => {
  const [isFinished, setIsFinished] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INITIAL_REVIEW_COUNT = useMemo(() => calcInitialReviewCount(Date.now()), []);
  const [reviewCount, setReviewCount] = useState(INITIAL_REVIEW_COUNT);

  const [appCount, setAppCount] = useState(() => {
    const now = Date.now();
    const stored = databaseService.getAllApplications?.()?.length ?? 0;
    return calcDynamicBaseCount(now) + stored;
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const scheduleNextTick = useCallback(() => {
    if (isFinished) return;

    const hour = new Date().getHours();
    let minMs: number;
    let maxMs: number;

    // 새벽(1~7): 매우 느리게
    if (hour >= 1 && hour <= 7) {
      minMs = 60 * 60 * 1000;
      maxMs = 120 * 60 * 1000;
    }
    // 저녁(19~23): 빠르게  ✅ (기존 코드 버그 수정: || → &&)
    else if (hour >= 19 && hour <= 23) {
      minMs = 10 * 60 * 1000;
      maxMs = 40 * 60 * 1000;
    }
    // 그 외: 보통
    else {
      minMs = 20 * 60 * 1000;
      maxMs = 60 * 60 * 1000;
    }

    const randomDelay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

    timerRef.current = setTimeout(() => {
      setIsUpdating(true);
      setAppCount((prev) => prev + 1);
      if (Math.random() > 0.8) setReviewCount((p) => p + 1);

      setTimeout(() => setIsUpdating(false), 2000);
      scheduleNextTick();
    }, randomDelay);
  }, [isFinished]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("admin")) {
      setShowLoginModal(true);
    }

    const handleScroll = () => {
      setShowFloatingCta(window.scrollY > 500);
    };

    const handleNewOrder = () => {
      setIsUpdating(true);
      setAppCount((prev) => prev + 1);
      if (Math.random() > 0.6) setReviewCount((prev) => prev + 1);
      setTimeout(() => setIsUpdating(false), 2000);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("new-saju-application", handleNewOrder as EventListener);

    scheduleNextTick();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("new-saju-application", handleNewOrder as EventListener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNextTick]);

  const handleSecretClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    if (newCount >= 5) {
      setShowLoginModal(true);
      setAdminClickCount(0);
    }

    setTimeout(() => setAdminClickCount(0), 3000);
  };

  const handleSimulatedUpdate = useCallback(() => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 2000);
  }, []);

  const handleComplete = () => {
    setError(null);
    setIsFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setIsFinished(false);
    setError(null);
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // ⚠️ 보안상 실제 배포에서는 하드코딩 비번 대신 서버/환경변수 권장
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
              <h3 className="text-[#FFD966] text-xl font-black tracking-tighter">OmySaju 운영 관리자</h3>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Admin Authorization</p>
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

      {!isFinished ? (
        <>
          <Promotion />
          <TrustBanner />

          <SummaryDashboard reviewCount={reviewCount} appCount={appCount} isUpdating={isUpdating} />

          <div className="px-4 pt-2 sm:pt-4 pb-12">
            <ReviewCarousel reviewCount={reviewCount} />
            <ConsultationForm onComplete={handleComplete} isLoading={false} />
            <LiveStatus cumulativeCount={appCount} onUpdate={handleSimulatedUpdate} />
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
                      <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">₩</span>29,800
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
                      <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">₩</span>55,000
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

          <div className="w-full py-20 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
            <p
              onClick={handleSecretClick}
              className="text-[10px] text-slate-600 font-bold cursor-default select-none text-center"
            >
              © 2026 OmySaju Lab Myeong-ri Service. All rights reserved.<br />
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
                성함과 입력된 정보를 기반으로 정밀 분석이 시작되었습니다.<br />
                <span className="text-slate-100 font-black">120페이지 분량의 프리미엄 인생 분석서</span>는<br />
                입금 확인 후 <span className="text-[#C02128] font-black">최대 6~12시간 이내</span>에<br />
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
