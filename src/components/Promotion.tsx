import React, { useCallback } from "react";
import EventCountdown from "./EventCountdown";

const Promotion: React.FC = () => {
  const scrollToForm = useCallback(() => {
    // SSR/빌드 환경에서도 안전하게
    if (typeof document === "undefined") return;
    const section = document.getElementById("self-input-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      {/* 0. 최상단 고정 가격 안내 바 (이미지 디자인 완벽 반영) */}
      <div className="w-full bg-[#02040a] py-6 sm:py-8 px-4 flex justify-center border-b border-white/5">
        <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-full p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-row items-center justify-between">
          {/* 가격 정보 파트 */}
          <div className="flex flex-1 items-center justify-around px-3 sm:px-8 border-r border-white/10 h-14 sm:h-20">
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#C02128] text-[9px] sm:text-[12px] font-black uppercase tracking-tighter">
                  46% OFF
                </span>
                <span className="text-slate-500 text-[9px] sm:text-[12px] font-bold line-through opacity-60">
                  55,000원
                </span>
              </div>
              <div className="text-white text-[18px] sm:text-[30px] font-black tracking-tighter flex items-center">
                <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">₩</span>
                29,800
                <span className="ml-1 text-slate-400 text-[10px] sm:text-[12px] font-bold opacity-80">
                  (1인)
                </span>
              </div>
            </div>

            <div className="w-[1px] h-10 bg-white/5" />

            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#4A90E2] text-[9px] sm:text-[12px] font-black uppercase tracking-tighter">
                  50% OFF
                </span>
                <span className="text-slate-500 text-[9px] sm:text-[12px] font-bold line-through opacity-60">
                  110,000원
                </span>
              </div>
              <div className="text-white text-[18px] sm:text-[30px] font-black tracking-tighter flex items-center">
                <span className="text-[#FFD966] mr-0.5 text-[14px] sm:text-[22px]">₩</span>
                55,000
                <span className="ml-1 text-[#4A90E2] text-[10px] sm:text-[12px] font-bold">
                  (2인+궁합)
                </span>
              </div>
            </div>
          </div>

          {/* 신청 버튼 파트 */}
          <div className="flex items-center justify-center px-2 sm:px-4">
            <button
              type="button"
              onClick={scrollToForm}
              className="w-[120px] sm:w-[220px] h-14 sm:h-20 bg-[#C02128] text-white rounded-full font-black text-[15px] sm:text-[26px] hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(192,33,40,0.4)] tracking-tighter flex items-center justify-center leading-tight"
            >
              <div className="flex flex-col items-center">
                <span>지금 바로</span>
                <span>신청하기</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 1. 긴급 공지 바 */}
      <div className="w-full bg-[#C02128] py-4 sm:py-6 px-4 text-center text-white shadow-lg z-30 border-b border-white/5 flex items-center justify-center gap-4 overflow-hidden">
        <div className="flex items-center gap-3 animate-pulse">
          <span className="text-[24px] sm:text-[32px] md:text-[40px]">📢</span>
          <span className="text-[21px] sm:text-[27px] md:text-[33px] font-black tracking-widest leading-none">
            선착순 특가 이벤트 마감 임박
          </span>
        </div>
      </div>

      {/* 2. 이벤트 카운트다운 */}
      <EventCountdown />

      {/* 3. 히어로 섹션 */}
      <div className="w-full luxury-dark pt-16 sm:pt-24 md:pt-32 pb-0 px-4 sm:px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/10 blur-[180px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
          <div className="mb-4 sm:mb-6 flex flex-col items-center">
            <span className="inline-block px-8 py-3 rounded-full bg-white/5 border border-[#FFD966]/30 text-[20px] sm:text-[26px] font-black tracking-[0.4em] text-[#FFD966] mb-4 sm:mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,217,102,0.15)]">
              2026 프리미엄 신년운세
            </span>
            <div className="w-px h-10 sm:h-14 bg-gradient-to-b from-white/0 via-[#FFD966]/40 to-white/0 mb-4 sm:mb-6" />
          </div>

          <div className="space-y-4 sm:space-y-8 mb-16 sm:mb-24">
            <h2 className="flex flex-col items-center gap-3 sm:gap-4">
              <span className="text-[18px] sm:text-[26px] md:text-[30px] font-medium text-slate-300 tracking-tight opacity-80">
                인생의 설계도가 있다면 어떨까요?
              </span>

              <span className="text-[22px] sm:text-[34px] md:text-[44px] font-black text-white tracking-tighter leading-tight">
                사주로 막히는 지점을 <span className="text-[#FF4D4D]">먼저 찾습니다.</span>
              </span>

              <div className="flex flex-col items-center mt-3 sm:mt-6">
                <span className="text-[16px] sm:text-[22px] md:text-[26px] font-light text-slate-400 mb-1">
                  그리고 ‘언제, 어디서’ 풀리는지
                </span>
                <span className="gold-shimmer text-[36px] sm:text-[60px] md:text-[80px] font-black tracking-tighter leading-none italic">
                  성공의 흐름을 잡아드립니다.
                </span>
              </div>
            </h2>

            <div className="max-w-3xl mx-auto pt-4 space-y-6">
              <div className="bg-white/5 border border-[#FFD966]/20 rounded-[32px] p-8 sm:p-12 backdrop-blur-xl relative overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/oriental-tiles.png')]" />
                <p className="gold-shimmer text-[18px] sm:text-[28px] md:text-[34px] font-black tracking-tighter leading-tight mb-4 relative z-10 drop-shadow-[0_0_15px_rgba(255,217,102,0.4)]">
                  평생운의 큰 흐름 + 2026년 월별 핵심 운세
                </p>
                <p className="gold-shimmer text-[16px] sm:text-[24px] md:text-[28px] font-black tracking-tighter italic relative z-10 leading-tight underline underline-offset-8 decoration-white/20">
                  &quot;이미 13,000명이 넘는 분들이 인생의 지도를 얻어갔습니다.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="relative group perspective-2000 mt-8 sm:mt-12 w-full max-w-[960px]">
            <div className="absolute inset-0 bg-[#FFD966]/15 blur-[150px] rounded-full scale-150 group-hover:bg-[#FFD966]/30 transition-all duration-1000" />

            <div className="relative w-full h-[520px] sm:h-[680px] mx-auto animate-float flex justify-center items-center">
              <div
                className="w-1/2 h-full bg-[#fefefe] rounded-l-[15px] sm:rounded-l-[40px] border-y-[3px] border-l-[3px] border-[#FFD966]/30 shadow-[-20px_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col p-4 sm:p-10 z-10"
                style={{ transform: "perspective(1500px) rotateY(12deg)", transformOrigin: "right" }}
              >
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />

                <div className="bg-slate-800/10 rounded-xl p-2 sm:p-4 mb-4 sm:mb-8 text-slate-700">
                  <div className="flex justify-between text-[8px] sm:text-[11px] font-black opacity-60 mb-1">
                    <span>분석 대상: 홍길동 (양력)</span>
                    <span>2026년 분석서</span>
                  </div>
                  <div className="h-px bg-slate-300 w-full" />
                </div>

                <div className="grid grid-cols-4 gap-1 sm:gap-3 text-center mb-6 sm:mb-10">
                  {["시주", "일주", "월주", "년주"].map((t) => (
                    <div key={t} className="text-[10px] sm:text-[16px] font-black text-slate-400">
                      {t}
                    </div>
                  ))}

                  {[
                    { color: "bg-amber-400", label: "무", sub: "편관" },
                    { color: "bg-slate-700", label: "임", sub: "일간(나)", text: "white" },
                    { color: "bg-red-500", label: "병", sub: "편재", text: "white" },
                    { color: "bg-white border-slate-300", label: "경", sub: "편인" },
                  ].map((item, i) => (
                    <div key={`top-${i}`} className="flex flex-col gap-1 sm:gap-2">
                      <div
                        className={`w-full aspect-square rounded-lg sm:rounded-2xl ${item.color} flex items-center justify-center text-[18px] sm:text-[34px] font-black shadow-sm border ${
                          item.text === "white" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[8px] sm:text-[12px] font-bold text-slate-500">{item.sub}</div>
                    </div>
                  ))}

                  {[
                    { color: "bg-white border-slate-300", label: "신", sub: "편인" },
                    { color: "bg-amber-400", label: "진", sub: "편관" },
                    { color: "bg-amber-400", label: "술", sub: "편관" },
                    { color: "bg-slate-700", label: "자", sub: "겁재", text: "white" },
                  ].map((item, i) => (
                    <div key={`bottom-${i}`} className="flex flex-col gap-1 sm:gap-2">
                      <div
                        className={`w-full aspect-square rounded-lg sm:rounded-2xl ${item.color} flex items-center justify-center text-[18px] sm:text-[34px] font-black shadow-sm border ${
                          item.text === "white" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[8px] sm:text-[12px] font-bold text-slate-500">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-2.5 h-[98%] bg-gradient-to-r from-black/90 via-[#FFD966]/60 to-black/90 z-20 shadow-[0_0_40px_rgba(255,217,102,0.5)] relative" />

              <div
                className="w-1/2 h-full bg-[#fefefe] rounded-r-[15px] sm:rounded-r-[40px] border-y-[3px] border-r-[3px] border-[#FFD966]/30 shadow-[20px_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-14 z-10"
                style={{ transform: "perspective(1500px) rotateY(-12deg)", transformOrigin: "left" }}
              >
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />

                <div className="relative z-10 text-center flex flex-col items-center w-full">
                  <h1 className="text-slate-800 text-[28px] sm:text-[52px] font-black tracking-tighter mb-2 sm:mb-6">
                    오마이사주
                  </h1>
                  <div className="bg-[#C02128] text-white px-5 sm:px-10 py-2 sm:py-3 rounded-md sm:rounded-xl text-[14px] sm:text-[28px] font-black mb-10 sm:mb-16 shadow-lg">
                    인생 종합 분석서
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-slate-800 text-[48px] sm:text-[96px] font-black tracking-tighter flex items-end leading-none">
                      120<span className="text-[#C02128] text-[24px] sm:text-[48px] mb-3 sm:mb-8">+</span>
                    </div>
                    <div className="text-slate-800 text-[24px] sm:text-[48px] font-black tracking-tighter mt-1 sm:mt-2">
                      페이지
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-10 sm:mt-16 px-4">
            <p className="text-[20px] sm:text-[34px] md:text-[41px] font-black leading-relaxed tracking-tighter text-white drop-shadow-[0_2px_15px_rgba(255,217,102,0.4)]">
              당신의 <span className="gold-shimmer">120페이지 분량의 초정밀 인생 지도</span>를
              <br className="hidden sm:block" />
              하늘이 기록한 문장 그대로{" "}
              <span className="text-[#FFD966] drop-shadow-[0_0_10px_rgba(255,217,102,0.6)]">평생 소장하세요.</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. 최종 가격 안내 섹션 */}
      <div className="w-full bg-[#02040a] pt-4 sm:pt-6 pb-6 sm:pb-10 px-4 sm:px-6 text-center">
        <div className="mb-12 sm:mb-20 space-y-6 sm:space-y-10">
          <h3 className="gold-shimmer text-[21px] sm:text-[37px] md:text-[49px] font-black leading-tight tracking-tighter drop-shadow-[0_0_20px_rgba(255,217,102,0.5)]">
            &quot;당신의 인생은 이 분석서 한 권으로 바뀝니다.&quot;
          </h3>
          <p className="gold-shimmer text-[18px] sm:text-[31px] md:text-[36px] font-black tracking-tighter italic drop-shadow-lg underline underline-offset-[12px] sm:underline-offset-[20px] decoration-white/20 leading-tight">
            월별로 ‘유리한 달/주의할 달’을 명확히 구분해드립니다.
          </p>
        </div>

        {/* 메인 가격 박스 - 프리미엄 인생 분석서 */}
        <div className="max-w-2xl mx-auto price-box rounded-[40px] sm:rounded-[80px] p-12 sm:p-20 mb-16 transform hover:scale-[1.03] transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD966]/5 blur-3xl rounded-full" />

          <div className="text-[#FFD966] text-[20px] sm:text-[35px] font-black tracking-tighter mb-4 sm:mb-8 flex items-center gap-2">
            💎 프리미엄 인생 분석서
          </div>

          <div className="text-slate-500 text-[26px] sm:text-[50px] line-through mb-4 font-bold opacity-30 tracking-tight italic">
            원가 55,000원
          </div>

          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-14">
            <span className="bg-[#C02128] text-white text-[14px] sm:text-[20px] px-5 py-2 rounded-full font-black animate-pulse shadow-lg tracking-widest">
              한정 특가 이벤트
            </span>
            <div className="text-[#FFD966] text-[20px] sm:text-[32px] font-black flex items-center gap-2 tracking-tighter uppercase">
              46% 할인중
            </div>
          </div>

          <div className="text-white text-[60px] sm:text-[90px] md:text-[120px] font-black flex items-center justify-center gap-2 sm:gap-3 tracking-tighter leading-none">
            <span className="text-2xl sm:text-6xl text-amber-500 font-black">₩</span> 29,800
          </div>
        </div>

        {/* 2인 동시 신청 섹션 */}
        <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6 bg-white/5 py-12 sm:py-20 px-8 sm:px-14 rounded-[40px] sm:rounded-[80px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden transform hover:scale-[1.03] transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="flex flex-col items-center relative z-10">
            <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-10 w-full justify-center">
              <span className="bg-[#C02128] text-white text-[12px] sm:text-[20px] px-4 sm:px-6 py-2 rounded-full font-black animate-pulse shadow-[0_0_20px_rgba(192,33,40,0.4)] whitespace-nowrap">
                50% OFF
              </span>
              <span className="text-[#FFD966] font-black text-[18px] sm:text-[42px] tracking-tighter whitespace-nowrap">
                💑 2인 동시 신청 시
              </span>
            </div>

            <div className="text-slate-500 text-[20px] sm:text-[40px] font-bold line-through opacity-40 mb-2 sm:mb-4 tracking-tight italic">
              원가 110,000원
            </div>

            <div className="text-white text-[56px] sm:text-[100px] md:text-[130px] font-black flex items-center justify-center gap-2 sm:gap-3 tracking-tighter mb-8 sm:mb-12 leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              <span className="text-2xl sm:text-7xl text-amber-500 font-black">₩</span> 55,000
            </div>

            <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
              <span className="text-white text-[15px] sm:text-[30px] font-black tracking-tight bg-[#C02128]/20 px-4 sm:px-8 py-2 sm:py-3 rounded-xl border border-[#C02128]/40 whitespace-nowrap">
                궁합 분석 서비스 무료 포함
              </span>
              <span className="text-white/40 text-[11px] sm:text-[18px] font-bold tracking-tight opacity-60">
                (필요 시 두 분의 인연법을 정밀 분석해 드립니다)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
