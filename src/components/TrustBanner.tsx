import React, { useEffect } from "react";

const STYLE_ID = "trust-banner-keyframes";

const TrustBanner: React.FC = () => {
  useEffect(() => {
    // 이미 주입되어 있으면 다시 추가하지 않음
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes text-shine {
        0%, 100% { 
          opacity: 1; 
          filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 217, 102, 0.2));
          transform: scale(1);
        }
        50% { 
          opacity: 0.9; 
          filter: brightness(1.5) drop-shadow(0 0 25px rgba(255, 217, 102, 0.5));
          transform: scale(1.02);
        }
      }
      .animate-text-shine {
        animation: text-shine 2s ease-in-out infinite;
      }
    `.trim();

    document.head.appendChild(style);
  }, []);

  return (
    <div className="w-full bg-[#02040a] pt-4 sm:pt-6 pb-4 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-5">
        <h2 className="text-[#FFD966] text-[24px] sm:text-[44px] font-black tracking-tighter leading-tight animate-text-shine">
          왜 많은 사람들이 오마이사주를 선택할까요?
        </h2>

        <div className="relative inline-block">
          <div className="absolute -inset-2 bg-[#C02128]/10 blur-2xl rounded-full opacity-50 animate-pulse"></div>
          <p className="relative z-10 text-slate-300 text-[16px] sm:text-[24px] font-bold leading-relaxed tracking-tight break-keep px-4">
            말이 아니라 숫자와 실제 고객의 선택이 증명합니다.
            <br className="hidden sm:block" />
            수많은 실제 후기와 누적 상담 참여 수가, 결과를 보여주고 있습니다.
          </p>
        </div>

        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#FFD966]/30 to-transparent mx-auto opacity-50 mt-4 sm:mt-6"></div>
      </div>
    </div>
  );
};

export default TrustBanner;
