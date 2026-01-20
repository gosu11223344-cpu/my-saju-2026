/* =========================
   기본 공통 타입
========================= */

export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar" | "lunar_leap";

export type ApplicationStatus =
  | "draft"
  | "pending"
  | "paid"
  | "completed"
  | "cancelled";

/* =========================
   사용자 입력 (신청 폼)
========================= */

export interface UserInput {
  name: string;
  gender: Gender;

  /** YYYY-MM-DD */
  birthDate: string;

  /** HH:mm (선택 입력) */
  birthTime?: string;

  calendarType: CalendarType;

  phone?: string;
  email?: string;

  /** 상품 코드 또는 상품명 */
  product?: string;

  /** 사용자가 직접 적은 문의 내용 */
  inquiry?: string;
}

/* =========================
   신청/결제 레코드
========================= */

export interface ApplicationRecord {
  id: string;

  /** ISO string */
  createdAt: string;

  status: ApplicationStatus;

  /** 실제 신청 데이터 원본 */
  input: UserInput;

  /** 결제 식별자 (결제 후에만 존재) */
  paymentId?: string;
}

/* =========================
   사주/운세 결과
========================= */

export interface MonthlyLuck {
  month: number; // 1 ~ 12
  description: string;
}

export interface FortuneResult {
  summary: string;

  /** 핵심 키워드 (예: 재물운, 전환기 등) */
  keyword: string;

  /** 0 ~ 100 */
  score: number;

  wealth: string;
  career: string;
  love: string;
  health: string;

  monthlyLuck: MonthlyLuck[];

  advice: string;
}
