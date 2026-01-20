import React, { memo } from "react";
import type { FortuneResult, UserInput } from "../types";

interface ResultCardProps {
  result: FortuneResult;
  user: UserInput;
  onReset: () => void;
}

type StatItemProps = {
  title: string;
  content: string;
  color: string;
  textClass: string;
};

const StatItem = memo(function StatItem({ title, content, color, textClass }: StatItemProps) {
  return (
    <div
      className={`p-6 sm:p-12 rounded-[24px] sm:rounded-[48px] border-2 ${color} shadow-sm hover:shadow-md transition-shadow`}
    >
      <h4 className={`font-black ${textClass} text-[18px] sm:text-[26px] mb-4 sm:mb-8 tracking-tighter`}>
        {title}
      </h4>
      <p className="text-[14px] sm:text-[19px] text-slate-700 font-bold leading-[1.7] tracking-tight">
        {content}
      </p>
    </div>
  );
});

const ResultCard: React.FC<ResultCardProps> = ({ result, user, onReset }) => {
  // score가 0~100 범위를 벗어나도 UI가 깨지지 않도록 클램프
  const safeScore = Math.max(0, Math.min(100, Number(result.score) || 0));

  return (
    <div className="space-y-8 sm:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-4xl mx-auto px-1 sm:px-4">
      {/* Top Banner */}
      <div className="luxury-dark rounded-[32px] sm:rounded-[64px] p-8 sm:p-20 text-white text-center shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-4 sm:p-12 opacity-[0.03] text-[80px] sm:text-[180px] font-black tracking-tighter pointer-events-none">
          2026
        </div>

        <div className="relative z-10">
          <p className="text-[#FFD966] text-lg sm:text-3xl font-black mb-4 sm:mb-8 tracking-[0.2em] sm:tracking-[0.4em] uppercase drop-shadow-md">
            {result.keyword}
          </p>

          <h2 className="text-[28px] sm:text-[56px] font-black mb-6 sm:mb-12 leading-tight tracking-tighter">
            {user.name}님의
            <br />
            2026년 운세 감명
          </h2>

          <div className="flex flex-col items-center">
            <div className="text-7xl sm:text-[12rem] font-black mb-4 sm:mb-10 text-white drop-shadow-2xl">
              {safeScore}
              <span className="text-2xl sm:text-5xl opacity-50 ml-1 sm:ml-4">점</span>
            </div>

            <div className="w-48 sm:w-96 h-3 sm:h-5 bg-white/10 rounded-full overflow-hidden mb-8 sm:mb-16 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#FFD966] to-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all duration-1500 ease-out"
                style={{ width: `${safeScore}%` }}
                aria-label="score bar"
              />
            </div>

            <p className="text-[16px] sm:text-[26px] font-bold text-slate-200 px-2 sm:px-10 leading-relaxed max-w-3xl mx-auto tracking-tight opacity-90">
              {result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10">
        <StatItem
          title="💰 재물운"
          content={result.wealth}
          color="bg-amber-50 border-amber-200"
          textClass="text-amber-900"
        />
        <StatItem
          title="💼 직업/학업운"
          content={result.career}
          color="bg-blue-50 border-blue-200"
          textClass="text-blue-900"
        />
        <StatItem
          title="❤️ 애정운"
          content={result.love}
          color="bg-rose-50 border-rose-200"
          textClass="text-rose-900"
        />
        <StatItem
          title="🏥 건강운"
          content={result.health}
          color="bg-emerald-50 border-emerald-200"
          textClass="text-emerald-900"
        />
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-[32px] sm:rounded-[64px] p-8 sm:p-20 shadow-xl border border-slate-50">
        <h3 className="text-[22px] sm:text-[36px] font-black mb-10 sm:mb-16 flex items-center gap-4 text-slate-800 tracking-tighter">
          <span className="text-amber-500 bg-amber-50 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-[18px] sm:rounded-[24px]">
            📅
          </span>
          2026년 월별 흐름도
        </h3>

        <div className="space-y-6 sm:space-y-12">
          {(result.monthlyLuck ?? []).map((item) => (
            <div
              key={item.month}
              className="flex flex-col sm:flex-row gap-4 sm:gap-10 border-b border-slate-100 pb-6 sm:pb-12 last:border-0 last:pb-0 group"
            >
              <div className="w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-[14px] sm:rounded-[24px] flex items-center justify-center font-black text-[18px] sm:text-[24px] text-slate-700 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                {item.month}월
              </div>

              <div className="flex-1 text-[15px] sm:text-[22px] text-slate-600 font-bold leading-[1.6] tracking-tight flex items-center">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Wisdom */}
      <div className="bg-[#1a1a1a] rounded-[32px] sm:rounded-[64px] p-10 sm:p-24 text-center text-white shadow-2xl relative border border-white/5 overflow-hidden">
        <div className="text-[#FFD966] text-xs sm:text-base font-black mb-4 sm:mb-10 tracking-[0.4em] uppercase opacity-50">
          Master&apos;s Advice
        </div>

        <h3 className="text-[#FFD966] text-xl sm:text-4xl font-black mb-6 sm:mb-12">마스터의 조언</h3>

        <p className="text-[17px] sm:text-[32px] font-bold leading-relaxed text-slate-100 italic tracking-tight">
          &quot;{result.advice}&quot;
        </p>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD966]/40 to-transparent" />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-8 sm:py-12 rounded-[24px] sm:rounded-[40px] font-black text-[18px] sm:text-[28px] text-slate-500 bg-white border-2 border-slate-100 shadow-xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98] mb-20"
      >
        새로운 운세 확인하기
      </button>
    </div>
  );
};

export default ResultCard;
