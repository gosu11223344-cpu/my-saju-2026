import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { databaseService } from "../services/databaseService";
import type { ApplicationRecord } from "../types";

type AppStatus = "completed" | "processing" | "analyzing" | "sending" | "preparing";

interface Application {
  id: string;
  name: string;
  phone: string;
  status: AppStatus;
  time: string;
  color: string;
  minutesAgo: number;
  isReal?: boolean;
}

interface LiveStatusProps {
  cumulativeCount: number;
  onUpdate?: () => void;
}

const FIRST_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
  "황",
  "안",
  "송",
  "전",
  "홍",
];

const LAST_NAMES = ["*훈", "*희", "*영", "*준", "*현", "*민", "*서", "*진", "*우", "*아", "*은", "*재", "*윤", "*호", "*빈", "*성", "*연", "*주"];

const AVATAR_COLORS = [
  "bg-slate-500",
  "bg-emerald-500",
  "bg-blue-600",
  "bg-slate-400",
  "bg-sky-500",
  "bg-indigo-400",
  "bg-blue-500",
  "bg-rose-500",
  "bg-amber-500",
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const formatTime = (totalMins: number) => {
  if (totalMins <= 2) return "방금 전";
  if (totalMins < 60) return `${totalMins}분 전`;
  const hours = Math.floor(totalMins / 60);
  return `${hours}시간 전`;
};

const maskName = (name: string) => {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "익명*";
  if (trimmed.length > 2) return `${trimmed[0]}*${trimmed[trimmed.length - 1]}`;
  return `${trimmed[0]}*`;
};

const maskPhone = (phone?: string) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  const last4 = digits.slice(-4) || "0000";
  return `010-****-${last4}`;
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const getTimedViewerCount = () => {
  const hour = new Date().getHours();
  // 18~05: 야간(30~47), 그 외: 주간(10~20)
  if (hour >= 18 || hour < 6) return Math.floor(Math.random() * 18) + 30;
  return Math.floor(Math.random() * 11) + 10;
};

const generateRandomApp = (idPrefix: string, baseMinutes = 0): Application => {
  const name = pick(FIRST_NAMES) + pick(LAST_NAMES);
  const phoneEnd = Math.floor(1000 + Math.random() * 9000);
  const color = pick(AVATAR_COLORS);
  const minutesAgo = clamp(baseMinutes + Math.floor(Math.random() * 10), 0, 599);

  return {
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    phone: `010-****-${phoneEnd}`,
    status: "completed",
    time: formatTime(minutesAgo),
    color,
    minutesAgo,
    isReal: false,
  };
};

const applyVisualStatuses = (list: Application[]): Application[] => {
  return list.map((app, index) => {
    // 실제 데이터가 "completed"가 아닌 상태로 들어오면 그대로 유지
    if (app.isReal && app.status !== "completed") return app;

    let status: AppStatus = "completed";
    if (index > 2 && index < 6) status = "processing";
    else if (index >= 6 && index < 9) status = "analyzing";
    else if (index >= 9 && index < 12) status = "preparing";
    else if (index >= 12) status = "sending";

    return { ...app, status };
  });
};

const StatusPill = ({ status }: { status: AppStatus }) => {
  switch (status) {
    case "processing":
      return (
        <span className="text-amber-600 bg-amber-50 px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black shadow-sm border border-amber-100/50">
          처리중
        </span>
      );
    case "analyzing":
      return (
        <span className="text-emerald-600 bg-emerald-50 px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black shadow-sm border border-emerald-100/50">
          분석중
        </span>
      );
    case "preparing":
      return (
        <span className="text-indigo-600 bg-indigo-50 px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black shadow-sm border border-indigo-100/50">
          발송 준비중
        </span>
      );
    case "sending":
      return (
        <span className="text-sky-600 bg-sky-50 px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black shadow-sm border border-sky-100/50">
          발송중
        </span>
      );
    case "completed":
    default:
      return (
        <span className="text-[#4A90E2] bg-[#EEF5FF] px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black shadow-sm border border-blue-100/50">
          접수완료
        </span>
      );
  }
};

const LiveStatus: React.FC<LiveStatusProps> = ({ cumulativeCount, onUpdate }) => {
  // setTimeout 타입: 브라우저/Node 모두 안전
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [viewerCount, setViewerCount] = useState<number>(() => getTimedViewerCount());
  const [apps, setApps] = useState<Application[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const processRecords = useCallback((records: ApplicationRecord[]) => {
    const now = new Date();

    const realApps: Application[] = records
      .flatMap((record) => {
        const main = record.companions?.[0];
        if (!main) return [];

        const createdAt = new Date(record.createdAt);
        const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

        if (diffMins < 0) return [];
        if (diffMins >= 600) return [];

        const statusFromRecord: AppStatus =
          record.status === "completed" ? "completed" : "processing";

        return [
          {
            id: record.id,
            name: maskName(main.name),
            phone: maskPhone(main.phone3),
            status: statusFromRecord,
            time: formatTime(diffMins),
            color: pick(AVATAR_COLORS),
            minutesAgo: diffMins,
            isReal: true,
          },
        ];
      })
      // minutesAgo 작은게 더 최신(방금 전)이라 위로 오게
      .sort((a, b) => a.minutesAgo - b.minutesAgo);

    const totalNeeded = 20;
    const combined: Application[] = [...realApps];

    let lastMins = combined.length > 0 ? combined[combined.length - 1].minutesAgo : 0;

    while (combined.length < totalNeeded) {
      lastMins += Math.floor(Math.random() * 30) + 15; // 15~44분 간격으로 과거로 추가
      if (lastMins >= 600) break;
      combined.push(generateRandomApp("sim", lastMins));
    }

    combined.sort((a, b) => a.minutesAgo - b.minutesAgo);
    setApps(applyVisualStatuses(combined.slice(0, 20)));
  }, []);

  const loadInitialData = useCallback(async () => {
    // 로컬 먼저
    const localRecords = databaseService.getAllApplications();
    processRecords(localRecords);

    // 원격 동기화(있으면 덮어쓰기)
    try {
      const remoteRecords = await databaseService.syncFromRemote();
      if (remoteRecords && remoteRecords.length > 0) processRecords(remoteRecords);
    } catch {
      console.warn("Remote data sync failed during initial load, using local data.");
    }
  }, [processRecords]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addNewApplication = useCallback(
    (name?: string, phone?: string) => {
      setIsUpdating(true);

      const newApp: Application = {
        id: name ? `real-${Date.now()}` : `sim-${Date.now()}`,
        name: name ? maskName(name) : pick(FIRST_NAMES) + pick(LAST_NAMES),
        phone: phone ? maskPhone(phone) : `010-****-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "completed",
        time: "방금 전",
        color: pick(AVATAR_COLORS),
        minutesAgo: 0,
        isReal: Boolean(name),
      };

      setApps((prev) => {
        // 기존 항목은 "시간 경과" 반영: 1분씩 증가(표시가 자연스러움)
        // (원래 코드의 +0은 의미가 없어서 실제 동작하도록 수정)
        const aged = prev
          .map((a) => {
            const nextMins = clamp(a.minutesAgo + 1, 0, 599);
            return { ...a, minutesAgo: nextMins, time: formatTime(nextMins) };
          })
          .filter((a) => a.minutesAgo < 600);

        const combined = [newApp, ...aged].sort((a, b) => a.minutesAgo - b.minutesAgo);
        return applyVisualStatuses(combined.slice(0, 20));
      });

      setViewerCount(getTimedViewerCount());
      onUpdate?.();

      const t = setTimeout(() => setIsUpdating(false), 2000);
      return () => clearTimeout(t);
    },
    [onUpdate]
  );

  useEffect(() => {
    const handleNewOrder = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; phone?: string }>;
      const { name, phone } = ce.detail || {};
      addNewApplication(name, phone);
    };

    if (typeof window === "undefined") return;
    window.addEventListener("new-saju-application", handleNewOrder as EventListener);
    return () => window.removeEventListener("new-saju-application", handleNewOrder as EventListener);
  }, [addNewApplication]);

  // 무작위 루프 타이머
  useEffect(() => {
    const scheduleNext = () => {
      const hour = new Date().getHours();

      let min: number;
      let max: number;

      // 시간대별 무작위 딜레이 (평균 36분 = 하루 40명 목표)
      if (hour >= 1 && hour <= 7) {
        min = 60;
        max = 150; // 새벽엔 아주 가끔
      } else {
        min = 10;
        max = 65; // 평소엔 10~65분 사이 무작위
      }

      const delay = (min + Math.random() * (max - min)) * 60 * 1000;

      timerRef.current = setTimeout(() => {
        addNewApplication();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [addNewApplication]);

  const footerText = useMemo(() => {
    return (
      <>
        ※ 현재{" "}
        <span
          className={`text-[#C02128] text-[16px] sm:text-[24px] font-black transition-all duration-700 ${
            isUpdating ? "text-[19px] sm:text-[30px]" : ""
          }`}
        >
          {viewerCount}명
        </span>
        의 사용자의 운세를 함께{" "}
        <span className="text-amber-600 underline underline-offset-4 font-black">실시간 분석 진행중</span>
        이며 <span className="text-[#C02128] font-black">순서대로 PDF 발송</span>을 진행중입니다.
      </>
    );
  }, [isUpdating, viewerCount]);

  return (
    <div className="w-full px-3 sm:px-6 mb-24 sm:mb-40">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] sm:rounded-[64px] border border-gray-100 overflow-hidden shadow-2xl">
        <div className="px-6 sm:px-16 py-6 sm:py-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <h3 className="font-black text-slate-800 text-[18px] sm:text-[23px] tracking-tighter">
              실시간 접수 현황
            </h3>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[11px] font-black shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[9px] sm:text-[12px] text-slate-300 font-bold uppercase tracking-widest">
              Cumulative Participants
            </span>
            <div className="text-[14px] sm:text-[20px] text-[#C02128] font-black tracking-tight">
              누적 참여 {cumulativeCount.toLocaleString()}명
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50 relative overflow-hidden">
          {apps.map((app, idx) => (
            <div
              key={app.id}
              className={`px-6 sm:px-16 py-3.5 sm:py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-700 group ${
                idx === 0 && isUpdating ? "bg-blue-50/80 animate-in fade-in slide-in-from-top-4" : ""
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-6">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${app.color} flex-shrink-0 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                >
                  {app.name[0]}
                </div>

                <div>
                  <div className="font-black text-slate-800 text-[12px] sm:text-[17px] tracking-tight">
                    {app.name}
                  </div>
                  <div className="text-slate-400 text-[9px] sm:text-[11px] font-bold">{app.phone}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
                <StatusPill status={app.status} />
                <span className="text-slate-300 text-[9px] sm:text-[12px] font-bold whitespace-nowrap min-w-[50px] sm:min-w-[80px] text-right">
                  {app.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`bg-slate-50 p-6 sm:p-10 text-center border-t border-gray-100 transition-all duration-1000 ${
            isUpdating ? "bg-blue-50" : ""
          }`}
        >
          <p
            className={`text-slate-600 text-[10px] sm:text-[15px] font-extrabold tracking-tight transition-all duration-500 ${
              isUpdating ? "scale-105" : "animate-pulse"
            }`}
          >
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;
