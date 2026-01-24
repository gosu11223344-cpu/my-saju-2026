import type { ApplicationRecord } from "../types";

const DB_KEY = "saju_applications_v1";

// 배포 후 받은 Apps Script URL
const GOOGLE_SHEET_URL =  "https://script.google.com/macros/s/AKfycby6zH7k9MYFKfiDEEGaLV8Jldp_2NZt3oJAXoYw24kWubXo5ule683CROwlA82eJwjs/exec";


// 상태 우선순위 (모르는 상태가 와도 안전하게 처리)
const STATUS_PRIORITY: Record<string, number> = {
  completed: 5,
  paid: 4,
  pending: 3,
  draft: 2,
  cancelled: 1
};

// 안전 JSON 파서
function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// row에서 companions(상세데이터) 추출 + 파싱
function extractCompanions(row: any): unknown[] {
  const raw =
    row?.companions ??
    row?.["상세데이터 (JSON)"] ??
    row?.["데이터(JSON)"] ??
    row?.데이터 ??
    row?.data;

  if (Array.isArray(raw)) return raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const parsed = safeParseJSON<unknown[]>(trimmed, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  return [];
}

// row를 ApplicationRecord로 변환
function rowToRecord(row: any): ApplicationRecord | null {
  const id = row?.id ?? row?.ID;
  if (!id) return null;

  const createdAt = row?.createdAt ?? row?.접수일시 ?? new Date().toISOString();
  const status = (row?.status ?? row?.상태 ?? "pending") as ApplicationRecord["status"];
  const companionsRaw = extractCompanions(row);

// ✅ 원격/로컬 어떤 데이터가 와도 "입금자 필드"가 둘 다 존재하도록 정규화
const companions = (Array.isArray(companionsRaw) ? companionsRaw : []).map((c: any) => {
  const payerDifferent = !!(c?.payerDifferent ?? c?.isDepositorDifferent);
  const payerName = String(c?.payerName ?? c?.depositorName ?? "").trim();

  const isDepositorDifferent = !!(c?.isDepositorDifferent ?? c?.payerDifferent);
  const depositorName = String(c?.depositorName ?? c?.payerName ?? "").trim();

  return {
    ...c,
    payerDifferent,
    payerName,
    isDepositorDifferent,
    depositorName,
  };
});

return {
  id: String(id),
  createdAt: String(createdAt),
  status,
  companions: companions as any[]
};

}

// 레코드 병합 (ID 기준)
function mergeRecords(a: ApplicationRecord, b: ApplicationRecord): ApplicationRecord {
  // companions는 더 “비어있지 않은 쪽” 우선
  const companions =
    (Array.isArray(b.companions) && b.companions.length > 0) ? b.companions : a.companions;

  // createdAt은 더 “최신”을 우선(또는 유효한 날짜 우선)
  const aTime = new Date(a.createdAt).getTime();
  const bTime = new Date(b.createdAt).getTime();
  const createdAt = bTime >= aTime ? b.createdAt : a.createdAt;

  // status 우선순위 비교
  const aP = STATUS_PRIORITY[String(a.status)] ?? 0;
  const bP = STATUS_PRIORITY[String(b.status)] ?? 0;
  const status = (bP >= aP ? b.status : a.status) as ApplicationRecord["status"];

  return { ...a, ...b, createdAt, status, companions };
}

export const databaseService = {
  // 로컬 데이터 로드
  getAllApplications(): ApplicationRecord[] {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return [];

  const parsed = safeParseJSON<ApplicationRecord[]>(data, []);
  const cleaned = (Array.isArray(parsed) ? parsed : [])
    .filter((app) => app && app.id)
    .map((app: any) => {
      const compsRaw = Array.isArray(app?.companions) ? app.companions : [];
      const companions = compsRaw.map((c: any) => {
        const payerDifferent = !!(c?.payerDifferent ?? c?.isDepositorDifferent);
        const payerName = String(c?.payerName ?? c?.depositorName ?? "").trim();

        const isDepositorDifferent = !!(c?.isDepositorDifferent ?? c?.payerDifferent);
        const depositorName = String(c?.depositorName ?? c?.payerName ?? "").trim();

        return { ...c, payerDifferent, payerName, isDepositorDifferent, depositorName };
      });

      return { ...app, companions };
    });

  // ✅ 기존 로컬 데이터도 영구적으로 정규화(마이그레이션)
  localStorage.setItem(DB_KEY, JSON.stringify(cleaned));
  return cleaned;
},


  // 원격 데이터 동기화 (로컬+원격 병합)
  async syncFromRemote(): Promise<ApplicationRecord[]> {
    const local = databaseService.getAllApplications();

    if (!GOOGLE_SHEET_URL) return local;

    try {
      const res = await fetch(`${GOOGLE_SHEET_URL}?t=${Date.now()}`, {
        method: "GET",
        // GET은 반드시 CORS 허용이 되어야 브라우저에서 읽을 수 있음
        // Apps Script 쪽에서 Access-Control-Allow-Origin 설정 필요
      });

      if (!res.ok) throw new Error(`Network error: ${res.status}`);

      const remoteRows = await res.json();
      if (!Array.isArray(remoteRows)) return local;

      const mergedMap = new Map<string, ApplicationRecord>();

      // 1) 로컬 먼저 넣기
      for (const app of local) {
        if (app?.id) mergedMap.set(app.id, app);
      }

      // 2) 원격 데이터로 병합/갱신
      for (const row of remoteRows) {
        const rec = rowToRecord(row);
        if (!rec) continue;

        const existing = mergedMap.get(rec.id);
        if (!existing) mergedMap.set(rec.id, rec);
        else mergedMap.set(rec.id, mergeRecords(existing, rec));
      }

      // 최종 데이터: companions가 있는 것만 보여주고 싶으면 유지, 아니면 주석 처리
      const finalData = Array.from(mergedMap.values()).filter(
        (app) => Array.isArray(app.companions) && app.companions.length > 0
      );

      // 최신 접수순 정렬
      finalData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      localStorage.setItem(DB_KEY, JSON.stringify(finalData));
      return finalData;
    } catch (err) {
      console.error("Sync failed:", err);
      return local;
    }
  },

// 신규 저장
async saveApplication(data: unknown[]): Promise<ApplicationRecord> {
  const normalizedCompanions = (Array.isArray(data) ? data : []).map((c: any) => ({
    ...c,

    // ✅ 이름 불일치 해결: 둘 다 저장되게 “동시에” 기록
    payerDifferent: !!(c?.payerDifferent ?? c?.isDepositorDifferent),
    payerName: String(c?.payerName ?? c?.depositorName ?? "").trim(),

    isDepositorDifferent: !!(c?.isDepositorDifferent ?? c?.payerDifferent),
    depositorName: String(c?.depositorName ?? c?.payerName ?? "").trim(),
  }));

  const newRecord: ApplicationRecord = {
    id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    companions: normalizedCompanions as any[]
  };


    // 로컬에 먼저 저장
    const existing = databaseService.getAllApplications();
    localStorage.setItem(DB_KEY, JSON.stringify([newRecord, ...existing]));

    // 서버 전송 (Apps Script가 POST를 받는 구조라면 OK)
    // ⚠️ mode:no-cors는 응답 확인이 불가(성공/실패 판정 불가) — “전송만” 목적일 때만 사용
    if (GOOGLE_SHEET_URL) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(newRecord)
        });
      } catch (e) {
        console.error("Server sync failed:", e);
      }
    }

    return newRecord;
  },

  // 상태 업데이트
  updateStatus(id: string, status: ApplicationRecord["status"]) {
    const apps = databaseService.getAllApplications();
    const updated = apps.map((app) => (app.id === id ? { ...app, status } : app));
    localStorage.setItem(DB_KEY, JSON.stringify(updated));

    if (GOOGLE_SHEET_URL) {
      fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateStatus", id, status })
      }).catch(() => {});
    }
  },

  // 삭제
  deleteApplication(id: string) {
    const apps = databaseService.getAllApplications();
    const updated = apps.filter((app) => app.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(updated));

    if (GOOGLE_SHEET_URL) {
      fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "delete", id })
      }).catch(() => {});
    }
  }
};
