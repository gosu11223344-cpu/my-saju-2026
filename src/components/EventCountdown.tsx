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
    // SSR 안전
    if (typeof window === "undefined") return;

    const getDeadline = () => {
      const now = Date.now();
      const stored = window.localStorage.getItem(EVENT_KEY);

      if (stored) {
        const deadline = Number(stored);
        // localStorage 값이 깨졌거나, 만료 후 너무 오래 지났으면 새로 시작
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

      // 만료 직후: expired 표시만 하고, 리셋은 "1시간 후" 규칙에 맡김
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });

        // 만료 후 1시간이 지났으면 즉시 리셋
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
          "relative w-full aspect-[4/5] max-w-[120px] rounded-[12px] sm:rounded-[24px]",
          "flex items-center justify-center bg-[#1a1a1a] border border-white/5",
          "shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.8)]",
          "mb-2 sm:mb-5 overflow-hidden",
        ].join(" ")}
      >
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/60 z-10" />
        <span
          className={[
            "text-[24px] xs:text-[32px] sm:text-[60px] md:text-[84px] font-[900] leading-none tracking-tighter z-20",
            isSeconds ? "text-[#FF4D4D]" : "text-white",
          ].join(" ")}
        >
          {pad2(value)}
        </span>
      </div>

      <span className="text-[#FFD966] text-[11px] sm:text-[20px] md:text-[30px] font-[900] tracking-tighter">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="flex flex-col gap-1 sm:gap-4 px-0.5 sm:px-2 pt-3 sm:pt-12">
      <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 bg-white/20 rounded-full" />
      <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 bg-white/20 rounded-full" />
    </div>
  );

  // "끊김 없는" 루프를 위해 텍스트 묶음을 두 번 렌더(트랙 200%) 후 50% 이동
  const marqueeItems = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <div className="w-full bg-[#02040a] pt-8 sm:pt-20 pb-0 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
        {/* 타이틀 영역 */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-8 sm:mb-16">
          <span className="text-lg sm:text-4xl animate-bounce">🔥</span>
          <h4 className="text-white text-[16px] xs:text-[20px] sm:text-[38px] md:text-[50px] font-[900] tracking-tighter text-center leading-none">
            이벤트 마감까지{" "}
            <span className="text-white relative inline-block">
              남은 시간
              <span className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[2px] sm:h-[6px] bg-[#C02128]" />
            </span>
          </h4>
          <span className="text-lg sm:text-4xl animate-bounce">🔥</span>
        </div>

        {/* 카운트다운 박스 영역 */}
        <div className="w-full flex items-start justify-center gap-1 sm:gap-4 md:gap-6 mb-10 sm:mb-20">
          <TimeUnit value={timeLeft.days} label="일" />
          <Separator />
          <TimeUnit value={timeLeft.hours} label="시" />
          <Separator />
          <TimeUnit value={timeLeft.minutes} label="분" />
          <Separator />
          <TimeUnit value={timeLeft.seconds} label="초" isSeconds />
        </div>
      </div>

      {/* 하단 무한 루프 공지 바 */}
      <div
        className="w-full relative h-10 sm:h-20 overflow-hidden shadow-2xl border-y border-white/10 flex items-center"
        style={{
          backgroundColor: "#C02128",
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 30px)",
        }}
      >
        <div className="marquee-track flex items-center">
          {/* 트랙을 2번 반복(총 200%) */}
          {[0, 1].map((dup) => (
            <div key={dup} className="flex whitespace-nowrap items-center">
              {marqueeItems.map((_, i) => (
                <div
                  key={`${dup}-${i}`}
                  className="flex items-center gap-4 sm:gap-12 px-4 sm:px-12 flex-shrink-0 italic"
                >
                  <p className="text-[#FFD966] text-[13px] sm:text-[28px] md:text-[32px] font-black tracking-tighter">
                    현재 신청 폭주!
                  </p>
                  <p className="text-white text-[13px] sm:text-[28px] md:text-[32px] font-black tracking-tighter">
                    결제 순서대로 리포트 발송중
                  </p>
                  <p className="text-white/30 text-[13px] sm:text-[28px] font-bold mx-1 sm:mx-2">|</p>
                  <p className="text-[#FFD966] text-[13px] sm:text-[28px] md:text-[32px] font-black tracking-tighter">
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
          100% { transform: translateX(-50%); } /* 트랙(200%)의 절반만 이동하면 끊김 없이 반복 */
        }
        .marquee-track {
          width: 200%;
          display: flex;
          animation: marquee 12s linear infinite;
          will-change: transform;
        }
        @media (max-width: 640px) {
          .marquee-track {
            animation-duration: 7s;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCountdown;
