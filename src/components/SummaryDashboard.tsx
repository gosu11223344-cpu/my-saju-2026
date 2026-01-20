import React, { useEffect } from "react";

interface SummaryDashboardProps {
  reviewCount: number;
  appCount: number;
  isUpdating: boolean;
}

const STYLE_ID = "summary-dashboard-keyframes";

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  reviewCount,
  appCount,
  isUpdating
}) => {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes live-flash {
        0%, 100% { opacity: 1; filter: brightness(1); transform: scale(1); }
        50% { opacity: 0.7; filter: brightness(1.8); transform: scale(1.08); }
      }
      .animate-live-flash {
        animation: live-flash 0.8s ease-in-out infinite;
      }
    `.trim();

    document.head.appendChild(style);
  }, []);

  return (
    <div className="w-full bg-[#02040a] px-4 pt-12 sm:pt-24 pb-4 sm:pb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* 후기 요약 카드 */}
        <div className="group bg-[#0a0c14] border border-white/10 rounded-[40px] sm:rounded-[60px] p-10 sm:p-20 flex flex-col items-center justify-center text-center transition-all hover:bg-[#11141d] hover:border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C02128]/20 to-transparent"></div>

          <h3 className="text-white text-[22px] sm:text-[42px] font-black tracking-tighter mb-10 sm:mb-20">
            고객님들 후기
          </h3>

          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[12px] sm:text-[18px] font-black uppercase tracking-[0.3em] mb-8 sm:mb-14 opacity-60">
              Reviews Total
            </span>

            <div className="flex flex-col items-center gap-4">
              <span className="text-white text-[18px] sm:text-[28px] font-bold opacity-80 tracking-tighter">
                실시간 누적
              </span>

              <div
                className={`text-white text-[38px] sm:text-[76px] font-black tracking-tighter leading-none mt-6 sm:mt-10 transition-all duration-700 ${
                  isUpdating ? "animate-live-flash" : ""
                }`}
              >
                <span className="text-[#C02128] tabular-nums drop-shadow-[0_0_20px_rgba(192,33,40,0.5)]">
                  {reviewCount.toLocaleString()}건+
                </span>
              </div>
            </div>

            <div className="mt-12 sm:mt-20 flex items-center gap-3 bg-green-500/10 text-green-500 px-7 py-3 rounded-full border border-green-500/20 text-[12px] sm:text-[17px] font-black animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.9)]"></span>
              LIVE CONNECTED
            </div>
          </div>
        </div>

        {/* 접수 현황 요약 카드 */}
        <div
          className={`group bg-[#0a0c14] border border-white/10 rounded-[40px] sm:rounded-[60px] p-10 sm:p-20 flex flex-col items-center justify-center text-center transition-all hover:bg-[#11141d] hover:border-white/20 shadow-2xl relative overflow-hidden ${
            isUpdating ? "ring-2 ring-[#C02128]/40 shadow-[0_0_60px_rgba(192,33,40,0.2)]" : ""
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C02128]/20 to-transparent"></div>

          <h3 className="text-white text-[22px] sm:text-[42px] font-black tracking-tighter mb-10 sm:mb-20">
            실시간 접수 현황
          </h3>

          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[12px] sm:text-[18px] font-black uppercase tracking-[0.3em] mb-8 sm:mb-14 opacity-60">
              Applications Total
            </span>

            <div className="flex flex-col items-center gap-4">
              <span className="text-white text-[18px] sm:text-[28px] font-bold opacity-80 tracking-tighter">
                누적 참여
              </span>

              <div
                className={`text-white text-[38px] sm:text-[76px] font-black tracking-tighter leading-none mt-6 sm:mt-10 transition-all duration-700 ${
                  isUpdating ? "animate-live-flash" : ""
                }`}
              >
                <span className="text-[#C02128] tabular-nums drop-shadow-[0_0_20px_rgba(192,33,40,0.5)]">
                  {appCount.toLocaleString()}명
                </span>
              </div>
            </div>

            <div className="mt-12 sm:mt-20 flex items-center gap-3 bg-green-500/10 text-green-500 px-7 py-3 rounded-full border border-green-500/20 text-[12px] sm:text-[17px] font-black animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.9)]"></span>
              LIVE CONNECTED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
