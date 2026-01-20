import React, { useEffect, useMemo, useState } from "react";

const EVENT_KEY = "saju_event_deadline_v3";
const INITIAL_DURATION = 12 * 60 * 60 * 1000; // 12시간
const RESET_GRACE = 60 * 60 * 1000; // 만료 후 1시간 지나면 자동 리셋

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const pad2 = (n: number) => String(n).padStart(2, "0");

const EventCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getDeadline = () => {
      const now = Date.now();
      const stored = window.localStorage.getItem(EVENT_KEY);

      if (stored) {
        const deadline = Number(stored);
        if (!Number.isFinite(deadline) || deadline <= 0 || now > deadline + RESET_GRACE) {
          const newDeadline = now + INITIAL_DURATION;
          window.localStorage.setItem(EVENT_KEY, String(newDeadline));
          return newDeadline;
        }
        return deadline;
      }

      const newDeadline = now + INITIAL_DURATION;
      window.localStorage.setItem(EVENT_KEY, String(newDeadline));
      return newDeadline;
    };

    let deadline = getDeadline();

    const calculateTime = () => {
      const now = Date.now();
      let diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });

        if (now > deadline + RESET_GRACE) {
          deadline = now + INITIAL_DURATION;
          window.localStorage.setItem(EVENT_KEY, String(deadline));
          diff = deadline - now;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: clamp(days, 0, 99),
        hours: clamp(hours, 0, 23),
        minutes: clamp(minutes, 0, 59),
        seconds: clamp(seconds, 0, 59),
        isExpired: false,
      });
    };

    calculateTime();
    const timer = window.setInterval(calculateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const TimeUnit = ({
    value,
    label,
    isSeconds = false,
  }: {
    value: number;
    label: string;
    isSeconds?: boolean;
  }) => (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div
        className={[
          "relative w-full aspect-[4/5] max-w-[82px] xs:max-w-[92px] sm:max-w-[120px] md:max-w-[140px]",
          "rounded-[14px] sm:rounded-[24px]",
          "flex items-center justify-center bg-[#141414] border border-white/5",
          "shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_14px_40px_rgba(0,0,0,0.75)]",
          "mb-2 sm:mb-5 overflow-hidden",
        ].join(" ")}
      >
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/60 z-10" />
        <span
          className={[
            "font-[900] leading-none tracking-tighter z-20",
            "text-[28px] xs:text-[34px] sm:text-[60px] md:text-[78px]",
            isSeconds ? "text-[#FF4D4D]" : "text-white",
          ].join(" ")}
        >
          {pad2(value)}
        </span>
      </div>

      <span className="text-[#FFD966] font-[900] tracking-tight text-[12px] xs:text-[13px] sm:text-[20px] md:text-[24px]">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="flex flex-col gap-1 sm:gap-4 px-1 sm:px-2 pt-2 sm:pt-10">
      <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 bg-white/20 rounded-full" />
      <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 bg-white/20 rounded-full" />
    </div>
  );

  const marqueeItems = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <div className="w-full bg-[#02040a] pt-7 sm:pt-18 pb-0 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">


        {/* ✅ 메인 타이틀: "마감까지 남은 시간"만 크게 + 반응형 */}
{/* ✅ 럭셔리 골드 반짝 배너 타이틀 */}
<div className="w-full flex justify-center mb-10 sm:mb-16 px-4">
  <div
    className="
      relative overflow-hidden
      px-6 sm:px-12 py-5 sm:py-8
      rounded-[22px] sm:rounded-[36px]
      border border-[#FFD966]/45
      bg-gradient-to-br from-[#2b2200] via-[#1a1500] to-[#090700]
      shadow-[0_22px_70px_rgba(0,0,0,0.75)]
      backdrop-blur-xl
    "
  >
    {/* 은은한 금빛 후광 */}
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#FFD966]/12 blur-[140px] rounded-full pointer-events-none" />

    {/* ✅ 반짝이는 Shimmer 레이어(배너처럼) */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="shimmer-sweep absolute -left-[60%] top-0 h-full w-[60%] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md opacity-70" />
    </div>

    {/* ✅ 텍스트 자체도 골드 그라데이션 + 펄스 */}
    <h4
      className="
        relative z-10 text-center font-black tracking-tight
        text-[32px] xs:text-[38px] sm:text-[58px] md:text-[72px]
        leading-[1.08]
        gold-text
        glow-pulse
      "
    >
      마감까지 남은 시간
    </h4>

    {/* 하단 골드 라인 */}
    <div className="mt-3 sm:mt-5 h-[2px] sm:h-[3px] w-full bg-gradient-to-r from-transparent via-[#FFD966] to-transparent opacity-85" />

    {/* ✅ 이 블록에서만 쓰는 애니메이션 */}
    <style>{`
      /* 텍스트 골드 그라데이션 */
      .gold-text{
        background: linear-gradient(90deg, #fff7cc 0%, #ffd966 30%, #fff3b0 50%, #ffd966 70%, #fff7cc 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      /* 배너 반짝 스윕 */
      @keyframes shimmerSweep {
        0% { transform: translateX(0); opacity: 0; }
        10% { opacity: 0.85; }
        50% { opacity: 0.9; }
        90% { opacity: 0.85; }
        100% { transform: translateX(220%); opacity: 0; }
      }
      .shimmer-sweep{
        animation: shimmerSweep 2.6s ease-in-out infinite;
      }

      /* 글자 자체가 살짝 살아 움직이는 느낌(과하지 않게) */
      @keyframes glowPulse {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(255,217,102,0.25)); transform: translateY(0); }
        50% { filter: drop-shadow(0 0 22px rgba(255,217,102,0.55)); transform: translateY(-1px); }
      }
      .glow-pulse{
        animation: glowPulse 1.9s ease-in-out infinite;
      }

      /* 모바일에서 반짝 속도 조금 빠르게 */
      @media (max-width: 640px) {
        .shimmer-sweep{ animation-duration: 2.1s; }
        .glow-pulse{ animation-duration: 1.6s; }
      }
    `}</style>
  </div>
</div>



        {/* ✅ 카운트다운 박스 */}
        <div className="w-full flex items-start justify-center gap-1.5 sm:gap-4 md:gap-6 mb-10 sm:mb-20">
          <TimeUnit value={timeLeft.days} label="일" />
          <Separator />
          <TimeUnit value={timeLeft.hours} label="시" />
          <Separator />
          <TimeUnit value={timeLeft.minutes} label="분" />
          <Separator />
          <TimeUnit value={timeLeft.seconds} label="초" isSeconds />
        </div>
      </div>

      {/* ✅ 하단 무한 루프 공지 바 */}
      <div
        className="w-full relative h-10 sm:h-20 overflow-hidden shadow-2xl border-y border-white/10 flex items-center"
        style={{
          backgroundColor: "#C02128",
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 30px)",
        }}
      >
        <div className="marquee-track flex items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex whitespace-nowrap items-center">
              {marqueeItems.map((_, i) => (
                <div
                  key={`${dup}-${i}`}
                  className="flex items-center gap-4 sm:gap-12 px-4 sm:px-12 flex-shrink-0 italic"
                >
                  <p className="text-[#FFD966] font-black tracking-tight text-[13px] sm:text-[28px] md:text-[32px]">
                    현재 신청 폭주!
                  </p>
                  <p className="text-white font-black tracking-tight text-[13px] sm:text-[28px] md:text-[32px]">
                    결제 순서대로 리포트 발송중
                  </p>
                  <p className="text-white/30 font-bold text-[13px] sm:text-[28px] mx-1 sm:mx-2">|</p>
                  <p className="text-[#FFD966] font-black tracking-tight text-[13px] sm:text-[28px] md:text-[32px]">
                    곧 할인 종료 예정
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          width: 200%;
          display: flex;
          animation: marquee 12s linear infinite;
          will-change: transform;
        }
        @media (max-width: 640px) {
          .marquee-track { animation-duration: 7s; }
        }
      `}</style>
    </div>
  );
};

export default EventCountdown;
