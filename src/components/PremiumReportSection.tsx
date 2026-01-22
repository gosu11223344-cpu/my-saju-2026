import React from "react";

const PremiumReportSection: React.FC = () => {
  return (
    // ✅ PC에서 좌우 폭 과도해지는 문제 해결:
    // - mx-auto + max-w 로 전체 폭 제한
    // - 패딩을 sm:p-20 → sm:p-12 lg:p-16 으로 줄여 PC에서 덜 넓어 보이게
<div className="mx-auto w-full max-w-5xl -mt-8 bg-[#050a14] rounded-[40px] sm:rounded-[60px] p-8 sm:p-12 lg:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,217,102,0.1)_0%,transparent_70%)] opacity-50"></div>

      <div className="relative z-10 text-center mb-12 sm:mb-20">
        <h3 className="gold-shimmer text-[22px] sm:text-[44px] font-black tracking-tighter mb-4 leading-tight">
          〈프리미엄 인생분석 리포트 구성〉
        </h3>
        <p className="text-slate-400 text-sm sm:text-lg font-bold tracking-tight opacity-70">
          단순한 운세가 아닌, 120페이지 분량의 초정밀 인생 공략본입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        {[
          { part: "PART 1", title: "나를 읽는 본성 분석", icon: "🧘", desc: "타고난 기질과 잠재력" },
          { part: "PART 2", title: "황금기 포착 가이드", icon: "✨", desc: "인생의 전성기 시점 파악" },
          { part: "PART 3", title: "사랑과 인연의 흐름", icon: "❤️", desc: "운명적 만남과 인연법" },
          { part: "PART 4", title: "부를 부르는 재물운", icon: "💰", desc: "돈의 흐름과 투자 타이밍" },
          { part: "PART 5", title: "성공을 위한 직업운", icon: "🚀", desc: "나에게 맞는 천직과 사회운" },
          { part: "PART 6", title: "신체 건강 시그널", icon: "🍎", desc: "조심해야 할 질병과 건강 관리" },
          { part: "PART 7", title: "나를 돕는 귀인", icon: "🤝", desc: "성공을 돕는 사람의 특징" },
          { part: "PART 8", title: "운을 바꾸는 개운비법", icon: "🍀", desc: "나쁜 운을 피하는 처방전" },
          { part: "PART 9", title: "2026년 월별 정밀 예언", icon: "🔮", desc: "열두 달의 상세 운세 예보" },
          { part: "PART 10", title: "향후 10년의 대운 흐름", icon: "📈", desc: "긴 안목의 미래 설계 지도" },
        ].map((item, i) => (
          <div
            key={i}
            className="group flex items-center gap-5 p-6 sm:p-7 rounded-[30px] bg-white/5 border border-white/10 hover:border-[#FFD966]/40 hover:bg-white/[0.08] transition-all duration-500"
          >
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-xl sm:text-3xl group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-[#FFD966]/20 transition-all"></div>
              <span className="relative z-10">{item.icon}</span>
            </div>
            <div>
              <div className="text-[#FFD966] text-[11px] sm:text-[13px] font-black tracking-widest uppercase mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {item.part}
              </div>
              <h4 className="text-white text-[17px] sm:text-[22px] font-black tracking-tighter mb-1">
                {item.title}
              </h4>
              <p className="text-slate-500 text-[12px] sm:text-[15px] font-bold group-hover:text-slate-300 transition-colors">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 sm:mt-20 pt-10 border-t border-white/10 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
          <span className="w-2 h-2 bg-[#FFD966] rounded-full animate-pulse"></span>
          <p className="text-[#FFD966] text-[13px] sm:text-[18px] font-black italic tracking-tight">
            * 모든 항목이 포함된{" "}
            <span className="text-white underline underline-offset-4 decoration-[#FFD966]">
              120페이지 PDF 분석서
            </span>
            가 발송됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumReportSection;
