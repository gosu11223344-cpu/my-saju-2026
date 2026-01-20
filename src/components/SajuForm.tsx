import React, { useState } from "react";
import type { UserInput, CalendarType, Gender } from "../types";

interface SajuFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

type BirthTimeOption = "" | "unknown" | "00:00" | "02:00" | "04:00" | "06:00" | "08:00" | "10:00" | "12:00" | "14:00" | "16:00" | "18:00" | "20:00" | "22:00";

const SajuForm: React.FC<SajuFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<{
    name: string;
    gender: Gender;
    birthDate: string;
    birthTime: BirthTimeOption;
    calendarType: CalendarType;
  }>({
    name: "",
    gender: "male",
    birthDate: "",
    birthTime: "unknown",
    calendarType: "solar"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "gender") return { ...prev, gender: value as Gender };
      if (name === "calendarType") return { ...prev, calendarType: value as CalendarType };
      if (name === "birthTime") return { ...prev, birthTime: value as BirthTimeOption };
      if (name === "name") return { ...prev, name: value };
      if (name === "birthDate") return { ...prev, birthDate: value };
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.birthDate) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    // UserInput 타입에 맞게 변환:
    // - birthTime은 optional이므로 unknown이면 보내지 않음
    const payload: UserInput = {
      name: formData.name.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate,
      calendarType: formData.calendarType
    };

    if (formData.birthTime && formData.birthTime !== "unknown") {
      payload.birthTime = formData.birthTime;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 shadow-xl space-y-6 max-w-xl mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">성함</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="성함을 입력하세요"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-bold"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">성별</label>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, gender: "male" }))}
                className={`flex-1 py-2 text-sm rounded-lg transition ${
                  formData.gender === "male"
                    ? "bg-white shadow-sm font-bold text-blue-600"
                    : "text-gray-500 font-medium"
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, gender: "female" }))}
                className={`flex-1 py-2 text-sm rounded-lg transition ${
                  formData.gender === "female"
                    ? "bg-white shadow-sm font-bold text-red-600"
                    : "text-gray-500 font-medium"
                }`}
              >
                여성
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">달력 선택</label>
            <select
              name="calendarType"
              value={formData.calendarType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            >
              <option value="solar">양력</option>
              <option value="lunar">음력</option>
              <option value="lunar_leap">음력(윤달)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">생년월일</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">태어난 시간</label>
            <select
              name="birthTime"
              value={formData.birthTime}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            >
              <option value="unknown">모름 (기본 분석)</option>
              <option value="00:00">00:00 - 01:29 (자시)</option>
              <option value="02:00">01:30 - 03:29 (축시)</option>
              <option value="04:00">03:30 - 05:29 (인시)</option>
              <option value="06:00">05:30 - 07:29 (묘시)</option>
              <option value="08:00">07:30 - 09:29 (진시)</option>
              <option value="10:00">09:30 - 11:29 (사시)</option>
              <option value="12:00">11:30 - 13:29 (오시)</option>
              <option value="14:00">13:30 - 15:29 (미시)</option>
              <option value="16:00">15:30 - 17:29 (신시)</option>
              <option value="18:00">17:30 - 19:29 (유시)</option>
              <option value="20:00">19:30 - 21:29 (술시)</option>
              <option value="22:00">21:30 - 23:29 (해시)</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition transform active:scale-95 tracking-tighter ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#B00020] hover:bg-[#D32F2F] shadow-red-200"
        }`}
      >
        {isLoading ? "운명의 데이터를 정밀 분석 중..." : "2026 초정밀 보고서 신청하기"}
      </button>

      <p className="text-center text-gray-400 text-xs font-bold">
        ※ 입력하신 정보는 암호화되어 안전하게 분석에만 활용됩니다.
      </p>
    </form>
  );
};

export default SajuForm;
