import React, { useEffect, useMemo, useState } from "react";

interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  content: string;
  color: string;
  timestamp: number;
}

interface ReviewDayStat {
  date: string;
  count: number;
}

interface ReviewCarouselProps {
  reviewCount: number;
  reviewStats: ReviewDayStat[]; // (호환 유지용) 현재 로직에서는 사용 안 함
}

const FIRST_NAMES = [
  "김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권","황","안","송","전","홍",
];

const LAST_NAMES = [
  "*훈","*희","*영","*준","*현","*민","*서","*진","*우","*아","*은","*재","*윤","*호","*빈","*성","*연","*주",
];

const AVATAR_COLORS = [
  "bg-blue-500","bg-indigo-500","bg-blue-600","bg-slate-500","bg-sky-500",
  "bg-indigo-400","bg-emerald-500","bg-rose-500","bg-amber-500","bg-violet-500",
];

const CONTENT_PARTS = {
  intro: [
    "처음에는 그냥 재미로 보려고 했는데 생각보다 내용이 너무 깊어서 깜짝 놀랐습니다.",
    "사주 상담 많이 받아봤지만 이렇게 문서로 깔끔하게 정리해 주는 곳은 처음이네요.",
    "반신반의하며 신청했는데 120페이지라는 압도적인 분량에 일단 한 번 놀라고 시작합니다.",
    "요즘 마음이 너무 답답해서 지푸라기라도 잡는 심정으로 결제했는데 결과 보고 마음이 좀 놓여요.",
    "인스타 광고 보고 들어왔는데 돈이 아깝지 않은 선택이었습니다.",
  ],
  middle: [
    "제가 작년에 겪었던 고생했던 일들을 마치 옆에서 보신 것처럼 콕 찝어내시는데 소름이 쫙 돋더라구요. 특히 인간관계에서 오는 스트레스 부분을 정확하게 분석해주셔서 위로가 많이 되었습니다.",
    "2026년 이직운이랑 재물운 파트가 제일 궁금했는데, 단순히 '운이 좋다'가 아니라 어느 달에 조심해야 하고 어느 시기에 승부를 걸어야 하는지 구체적인 행동 지침이 있어서 정말 실용적입니다.",
    "제 성격의 장단점을 너무 잘 파악하고 계셔서 놀랐어요. 제가 왜 그렇게 행동했는지 이제야 이해가 가네요. 앞으로 어떻게 인생을 설계해야 할지 지도를 얻은 기분입니다.",
    "연애운 부분에서 제가 만나는 사람 스타일이랑 갈등 생기는 포인트까지 다 나와있네요. 앞으로는 조언해주신 대로 조금 더 여유를 가지고 대처해보려고 합니다.",
    "사업 준비 중이라 고민이 많았는데, 제 사주에 부족한 오행을 채우는 개운법까지 상세하게 적혀 있어서 큰 도움이 될 것 같습니다. 매일 아침마다 한 번씩 읽어보려구요.",
  ],
  outro: [
    "치킨 한 마리 값으로 이런 고퀄리티 인생 공략집을 평생 소장할 수 있다니 정말 행운이라고 생각합니다. 주변 친구들한테도 벌써 추천 날렸어요!",
    "상담 받으면 돌아서서 잊어버리기 일쑤인데 이렇게 PDF로 소장하니까 언제든 다시 꺼내볼 수 있어서 너무 좋습니다. 2026년 대비 완료입니다!",
    "왜 이제야 알았나 싶네요. 진작 알았으면 작년에 그 고생 안 했을 텐데... 그래도 이제라도 제 인생의 흐름을 알게 되어 다행입니다. 감사합니다.",
    "고민하시는 분들 그냥 지르세요. 내용 퀄리티가 차원이 다릅니다. 돈 5만원 주고 신점 보는 것보다 백번 천번 낫습니다.",
    "마스터님의 정성이 느껴지는 분석서였습니다. 무제한 질문권도 있다고 하니 더 든든하네요. 잘 읽고 2026년 대박 나겠습니다!",
  ],
};

/**
 * total(누적 후기 수)을 만들려면 며칠치(6~12/일)가 필요한지 역산
 */
function estimateStartDaysNeeded(total: number) {
  let sum = 0;
  let d = 0;

  while (sum < total) {
    const x = (d * 9301 + 49297) % 233280;
    const daily = 6 + (x % 7); // 6~12
    sum += daily;
    d++;
  }
  return d; // 며칠치가 필요했는지
}

// dayIndex별 6~12개 (고정 패턴)
function dailyCountByIndex(dayIndex: number) {
  const x = (dayIndex * 9301 + 49297) % 233280;
  return 6 + (x % 7); // 6~12
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviewCount, reviewStats }) => {
  // (미사용 경고 방지용)
  void reviewStats;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dynamicCount = Math.max(0, reviewCount);
  const totalPages = Math.max(1, Math.ceil(dynamicCount / itemsPerPage));

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const REVIEWS = useMemo(() => {
    const total = Math.max(0, dynamicCount);
    if (total === 0) return [];

    // ✅ 오늘 0시(로컬)
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);

    // ✅ 필요한 일수 (sum>=total)
    const daysNeeded = estimateStartDaysNeeded(total);

    // ✅ 핵심 수정: "오늘 포함"되도록 시작일을 잡음 (daysNeeded-1일 전)
    const startDate = new Date(today0);
    startDate.setDate(startDate.getDate() - (daysNeeded - 1));

    // ✅ 먼저 daysNeeded일의 "하루 6~12 패턴" 용량을 만든다
    const dayCounts = Array.from({ length: daysNeeded }, (_, idx) => dailyCountByIndex(idx));
    const capacity = dayCounts.reduce((s, n) => s + n, 0);

    // ✅ total보다 초과된 수량은 "가장 오래된 날짜부터" 깎는다
    //    -> 최근(어제/오늘)은 6~12개를 유지하게 됨
    let excess = Math.max(0, capacity - total);
    for (let i = 0; i < dayCounts.length && excess > 0; i++) {
      const cut = Math.min(excess, dayCounts[i]);
      dayCounts[i] -= cut;
      excess -= cut;
    }

    // ✅ 이제 dayCounts대로 실제 리뷰 생성 (총 개수 = total 정확히 일치)
    const all: Review[] = [];
    let id = 1;

    for (let dayIndex = 0; dayIndex < daysNeeded; dayIndex++) {
      const cnt = dayCounts[dayIndex];
      if (cnt <= 0) continue;

      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIndex);

      for (let i = 0; i < cnt; i++) {
        const firstName = FIRST_NAMES[id % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(id * 7) % LAST_NAMES.length];

        const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(
          currentDate.getDate()
        ).padStart(2, "0")}`;

        const introIdx = id % CONTENT_PARTS.intro.length;
        const middleIdx = (id * 3) % CONTENT_PARTS.middle.length;
        const outroIdx = (id * 13) % CONTENT_PARTS.outro.length;

        const content =
          id % 3 === 0
            ? `${CONTENT_PARTS.intro[introIdx]} ${CONTENT_PARTS.outro[outroIdx]}`
            : `${CONTENT_PARTS.intro[introIdx]} ${CONTENT_PARTS.middle[middleIdx]} ${CONTENT_PARTS.outro[outroIdx]}`;

        all.push({
          id,
          name: firstName + lastName,
          date: dateStr,
          rating: 5,
          content,
          color: AVATAR_COLORS[id % AVATAR_COLORS.length],
          // 하루 내 시간 분산(최대 12개라 0~11시로 충분)
          timestamp: currentDate.getTime() + i * 60 * 60 * 1000,
        });

        id++;
      }
    }

    return all.sort((a, b) => b.timestamp - a.timestamp);
  }, [dynamicCount]);

  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return REVIEWS.slice(start, start + itemsPerPage);
  }, [REVIEWS, currentPage]);

  const pageNumbers = useMemo(() => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 640 : false;
    const delta = isMobile ? 2 : 4;

    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const inRange =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta) ||
        (currentPage <= 5 && i <= 8);

      if (inRange) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (p: number | string) => {
    if (typeof p !== "number") return;
    setCurrentPage(p);

    const el = document.getElementById("reviews-top");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto mt-2 sm:mt-3 bg-white rounded-[32px] sm:rounded-[48px] overflow-hidden border border-gray-100 shadow-xl"
      id="reviews-top"
    >
      <div className="px-6 sm:px-10 py-5 sm:py-7 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
        <div>
          <h3 className="font-black text-slate-800 text-lg sm:text-2xl tracking-tighter">
            고객님들 후기
          </h3>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
          <span className="text-base sm:text-xl text-[#C02128] font-black tabular-nums">
            누적 {dynamicCount.toLocaleString()}건+
          </span>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-amber-400 text-sm sm:text-base">★</span>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {currentReviews.map((review) => (
          <div key={review.id} className="p-5 sm:p-7 hover:bg-slate-50/30 transition-colors">
            <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-4">
              <div
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${review.color} flex items-center justify-center font-black text-white text-sm sm:text-lg shadow-sm`}
                aria-hidden="true"
              >
                {review.name[0]}
              </div>
              <div>
                <span className="font-black text-slate-800 text-[15px] sm:text-[18px]">
                  {review.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-amber-400 text-[10px] sm:text-[12px]">★</span>
                    ))}
                  </div>
                  <span className="text-slate-400 text-[11px] sm:text-[13px] font-bold">
                    {review.date}
                    {review.id % 7 === 0 && (
                      <span className="ml-2 text-blue-500 font-black text-[9px] uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-[14px] sm:text-[17px] leading-relaxed font-medium whitespace-pre-line tracking-tight">
              {review.content}
            </p>
          </div>
        ))}
      </div>

      <div className="p-8 sm:p-14 flex flex-col items-center gap-6 bg-slate-50/30 border-t border-gray-100">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:border-slate-300 transition-all font-bold"
            aria-label="First page"
          >
            «
          </button>

          <div className="flex gap-1.5 sm:gap-2 md:gap-3 items-center">
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="text-slate-300 font-bold px-0.5 sm:px-1">...</span>
              ) : (
                <button
                  type="button"
                  key={`page-${p}`}
                  onClick={() => handlePageChange(p as number)}
                  className={`w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-2xl text-[12px] sm:text-[15px] font-black border-2 transition-all ${
                    currentPage === p
                      ? "bg-[#C02128] text-white border-[#C02128] shadow-lg scale-110"
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                  }`}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:border-slate-300 transition-all font-bold"
            aria-label="Last page"
          >
            »
          </button>
        </div>

        <p className="text-[10px] sm:text-[12px] font-bold text-slate-300 uppercase tracking-widest text-center">
          PAGE <span className="text-slate-400">{currentPage}</span> / {totalPages} ({dynamicCount.toLocaleString()}건 REVIEWS)
        </p>
      </div>
    </div>
  );
};

export default ReviewCarousel;
