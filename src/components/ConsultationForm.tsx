
import React, { useState, useEffect, useRef } from 'react';
import { UserInput, CalendarType, Gender } from '../types';
import EventCountdown from './EventCountdown';
import { databaseService } from '../services/databaseService';

interface Companion {
  id: number;
  gender: 'male' | 'female';
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  calendarType: 'solar' | 'lunar' | 'leap';
  birthHour: string;
  birthMinute: string;
  phone1: string;
  phone2: string;
  phone3: string;
  emailId: string;
  emailDomain: string;
  deliveryMethod: 'kakao' | 'email';
  maritalStatus: 'single' | 'married';
  product: string;
  deliveryAddress?: string;
  inquiry: string;
  isSyncedWithMain?: boolean;
  wantsCompatibility?: boolean;
  isDepositorDifferent?: boolean;
  depositorName?: string;
}

interface ConsultationFormProps {
  onComplete: () => void;
  isLoading: boolean;
}

type FormStep = 'form' | 'payment' | 'confirming';


// ✅ 프리미엄 인생분석 리포트 구성 (App.tsx에서 하단에 재사용할 컴포넌트)

const ConsultationForm: React.FC<ConsultationFormProps> = ({ onComplete, isLoading }) => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isAgreed, setIsAgreed] = useState(true);
  const [step, setStep] = useState<FormStep>('form');
  const [showSms, setShowSms] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });
  const paymentRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (companions.length === 0) {
      addCompanion();
    }
  }, []);

  const triggerSmsNotification = (msg: string) => {
    setShowSms({ show: true, msg });
    setTimeout(() => setShowSms({ show: false, msg: "" }), 5000);
  };

  const addCompanion = (overrides?: Partial<Companion>) => {
    if (companions.length >= 4) {
      alert('동반자는 본인 포함 최대 4명까지 신청 가능합니다.');
      return;
    }
    const newCompanion: Companion = {
      id: Date.now() + Math.random(),
      gender: 'male',
      name: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      calendarType: 'solar',
      birthHour: 'unknown',
      birthMinute: '00',
      phone1: '010',
      phone2: '',
      phone3: '',
      emailId: '',
      emailDomain: 'naver.com',
      deliveryMethod: 'kakao',
      maritalStatus: 'single',
      product: '',
      inquiry: '',
      isSyncedWithMain: false,
      wantsCompatibility: true,
      isDepositorDifferent: false,
      depositorName: '',
      ...overrides
    };
    setCompanions(prev => [...prev, newCompanion]);
  };

  const removeCompanion = (id: number) => {
    if (companions.length === 1) return;
    setCompanions(companions.filter(c => c.id !== id));
  };

  const updateCompanion = (id: number, field: keyof Companion, value: any) => {
    let processedValue = value;
    if (field === 'phone2' || field === 'phone3') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    }

    setCompanions(prev => {
      const isMain = prev[0].id === id;
      const prevMainProduct = prev[0].product;

      let updatedList = prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, [field]: processedValue };
          if (c.isSyncedWithMain && ['phone1', 'phone2', 'phone3', 'emailId', 'emailDomain', 'deliveryMethod'].includes(field as string)) {
             updated.isSyncedWithMain = false;
          }
          return updated;
        }
        return c;
      });

      if (isMain && field === 'product') {
        if (processedValue === 'couple' && updatedList.length === 1) {
          const newCompanion: Companion = {
            id: Date.now() + Math.random(),
            gender: updatedList[0].gender === 'male' ? 'female' : 'male',
            name: '',
            birthYear: '',
            birthMonth: '',
            birthDay: '',
            calendarType: 'solar',
            birthHour: 'unknown',
            birthMinute: '00',
            phone1: updatedList[0].phone1,
            phone2: updatedList[0].phone2,
            phone3: updatedList[0].phone3,
            emailId: updatedList[0].emailId,
            emailDomain: updatedList[0].emailDomain,
            deliveryMethod: updatedList[0].deliveryMethod,
            maritalStatus: 'single',
            product: 'couple',
            inquiry: '',
            isSyncedWithMain: true,
            wantsCompatibility: true,
          };
          updatedList = [...updatedList, newCompanion];
        } 
        else if (processedValue !== 'couple' && prevMainProduct === 'couple' && updatedList.length === 2) {
          updatedList = [updatedList[0]];
        }
      }

      if (updatedList[0].id === id) {
        const main = updatedList[0];
        return updatedList.map((c, i) => {
          if (i > 0 && c.isSyncedWithMain) {
            return {
              ...c,
              phone1: main.phone1,
              phone2: main.phone2,
              phone3: main.phone3,
              emailId: main.emailId,
              emailDomain: main.emailDomain,
              deliveryMethod: main.deliveryMethod,
            };
          }
          return c;
        });
      }
      return updatedList;
    });
  };

  const toggleSync = (id: number, checked: boolean) => {
    const main = companions[0];
    setCompanions(prev => prev.map(c => {
      if (c.id === id) {
        if (checked) {
          return {
            ...c,
            isSyncedWithMain: true,
            phone1: main.phone1,
            phone2: main.phone2,
            phone3: main.phone3,
            emailId: main.emailId,
            emailDomain: main.emailDomain,
            deliveryMethod: main.deliveryMethod,
          };
        } else {
          return { ...c, isSyncedWithMain: false };
        }
      }
      return c;
    }));
  };

  const getPhoneErrorMessage = (val: string) => {
    if (!val) return null;
    if (val.length < 4) return "4자리 필수";
    return null;
  };

  const getPriceByProduct = (product: string) => {
    if (product === 'premium') return 29800;
    if (product === 'couple') return 55000;
    if (product === 'year') return 19800;
    return 0;
  };

  const getTotalPrice = () => {
    const coupleCount = companions.filter(c => c.product === 'couple').length;
    const couplePackagesPrice = Math.ceil(coupleCount / 2) * 55000;
    const otherProductsPrice = companions
      .filter(c => c.product !== 'couple')
      .reduce((acc, curr) => acc + getPriceByProduct(curr.product), 0);
    return couplePackagesPrice + otherProductsPrice;
  };

  const handleApplyClick = () => {
    if (!isAgreed) {
      alert('개인정보 이용 약관에 동의해주세요.');
      return;
    }

    const self = companions[0];
    const allProductsSelected = companions.every(c => c.product !== '');
    
    if (self.isDepositorDifferent && !self.depositorName?.trim()) {
      alert('실제 입금하시는 분의 성함을 입력해주세요.');
      return;
    }

    const hasCoupleProduct = companions.some(c => c.product === 'couple');
    if (hasCoupleProduct && companions.length < 2) {
      alert('2인 궁합 패키지는 상대방 정보 입력이 필수입니다.');
      return;
    }

    const allPhonesValid = companions.every(c => c.phone2.length === 4 && c.phone3.length === 4);
    if (!allPhonesValid) {
      alert('전화번호를 4자리씩 정확히 입력해주세요.');
      return;
    }

    if (!self.name || !self.birthYear || !self.birthMonth || !self.birthDay || !allProductsSelected) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    databaseService.saveApplication(companions);
    setStep('payment');
    
    setTimeout(() => {
      const el = document.getElementById('payment-info-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    triggerSmsNotification(`[오마이사주] ${self.name}님 접수 완료. 안내된 계좌로 입금 주시면 확인 후 결과가 발송됩니다.`);
  };

  const handlePaymentDone = () => {
    setStep('confirming');
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  const years = Array.from({ length: 100 }, (_, i) => (2026 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  const standardDomains = ["naver.com", "gmail.com", "daum.net", "hanmail.net", "kakao.com", "nate.com"];
  const emailDomains = [...standardDomains, "직접입력"];

  const finalDepositorName = companions[0]?.isDepositorDifferent ? companions[0]?.depositorName : companions[0]?.name;

  return (
<div
  id="self-input-section"
  className="w-full bg-[#FFFBF2] py-6 sm:py-16 px-3 sm:px-6 md:px-12 pb-24 relative scroll-mt-[120px] sm:scroll-mt-[140px]"
>
      {showSms.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-in slide-in-from-top-full duration-500">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[20px] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-base flex-shrink-0">💬</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Message</span>
                <span className="text-[9px] font-bold text-gray-400">방금 전</span>
              </div>
              <p className="text-[12px] font-bold text-gray-800 leading-tight">{showSms.msg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-12">
        {step === 'form' && (
          <>


            <div className="space-y-6 sm:space-y-12 pt-6 sm:pt-4">

              {companions.map((companion, index) => (
                <div key={companion.id} className={`bg-white rounded-[24px] sm:rounded-[48px] border-[2px] p-6 sm:p-10 md:p-14 space-y-6 sm:space-y-10 relative shadow-xl transition-all duration-500 ${companion.product === 'couple' ? 'border-amber-400 bg-amber-50/10' : 'border-[#FFD966]'}`}>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-4 sm:pb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-3xl">{index === 0 ? "👑" : "👤"}</span>
                      <h3 className="font-black text-[#B84A1A] text-[18px] sm:text-[28px] tracking-tighter">
                        {index === 0 ? "본인 정보" : `상대방(동반자) 정보`}
                      </h3>
                    </div>
                    {index > 0 && (
                      <button onClick={() => removeCompanion(companion.id)} className="text-red-500 font-bold text-[11px] sm:text-[13px] bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition">✕ 삭제</button>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
                      <span className="text-blue-800 font-bold text-sm sm:text-base">연락처/이메일 정보가 동일한가요?</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={companion.isSyncedWithMain} 
                          onChange={(e) => toggleSync(companion.id, e.target.checked)}
                          className="w-5 h-5 sm:w-6 sm:h-6 accent-blue-600 rounded"
                        />
                        <span className="font-black text-blue-600 text-sm">본인 정보와 동일</span>
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-3">성별 <span className="text-red-500">*</span></label>
                      <div className="flex gap-8">
                        {['male', 'female'].map(g => (
                          <label key={g} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name={`gender-${companion.id}`} checked={companion.gender === g} onChange={() => updateCompanion(companion.id, 'gender', g)} className="w-5 h-5 sm:w-6 sm:h-6 accent-blue-600" />
                            <span className={`font-black text-[15px] sm:text-[17px] ${companion.gender === g ? 'text-blue-600' : 'text-slate-400'}`}>
                              {g === 'male' ? '남성' : '여성'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">성함 <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="성함을 입력해주세요" value={companion.name} onChange={(e) => updateCompanion(companion.id, 'name', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-5 font-black text-[16px] sm:text-[18px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">생년월일 <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <select value={companion.birthYear} onChange={(e) => updateCompanion(companion.id, 'birthYear', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-1 sm:px-3 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none appearance-none text-center">
                          <option value="">년도</option>
                          {years.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                        <select value={companion.birthMonth} onChange={(e) => updateCompanion(companion.id, 'birthMonth', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-1 sm:px-3 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none appearance-none text-center">
                          <option value="">월</option>
                          {months.map(m => <option key={m} value={m}>{m}월</option>)}
                        </select>
                        <select value={companion.birthDay} onChange={(e) => updateCompanion(companion.id, 'birthDay', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-1 sm:px-3 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none appearance-none text-center">
                          <option value="">일</option>
                          {days.map(d => <option key={d} value={d}>{d}일</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">태어난 시간 <span className="text-slate-400 text-xs font-bold">(모를 경우 모름 선택)</span></label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <select value={companion.birthHour} onChange={(e) => updateCompanion(companion.id, 'birthHour', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-3 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none">
                          <option value="unknown">모름</option>
                          {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                        </select>
                        <select disabled={companion.birthHour === 'unknown'} value={companion.birthMinute} onChange={(e) => updateCompanion(companion.id, 'birthMinute', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-3 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none disabled:bg-slate-50 disabled:border-slate-200">
                          {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-3">달력 <span className="text-red-500">*</span></label>
                      <div className="flex gap-6 flex-wrap">
                        {['solar', 'lunar', 'leap'].map((t) => (
                          <label key={t} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name={`calendar-${companion.id}`} checked={companion.calendarType === t} onChange={() => updateCompanion(companion.id, 'calendarType', t)} className="w-5 h-5 sm:w-6 sm:h-6 accent-blue-600" />
                            <span className={`font-black text-[15px] sm:text-[17px] ${companion.calendarType === t ? 'text-blue-600' : 'text-slate-400'}`}>
                              {t === 'solar' ? '양력' : t === 'lunar' ? '음력' : '윤달'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">연락처 <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <input type="text" maxLength={3} value={companion.phone1} onChange={(e) => updateCompanion(companion.id, 'phone1', e.target.value)} className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-1 font-black text-center text-[14px] sm:text-[17px] text-slate-900 outline-none ${companion.isSyncedWithMain ? 'opacity-50' : ''}`} disabled={companion.isSyncedWithMain} />
                        <div className="relative">
                          <input type="text" placeholder="0000" value={companion.phone2} onChange={(e) => updateCompanion(companion.id, 'phone2', e.target.value)} className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] bg-white px-1 font-black text-center text-[14px] sm:text-[17px] text-slate-900 outline-none ${getPhoneErrorMessage(companion.phone2) ? 'border-red-400' : 'border-[#FFD966]'} ${companion.isSyncedWithMain ? 'opacity-50' : ''}`} disabled={companion.isSyncedWithMain} />
                          {getPhoneErrorMessage(companion.phone2) && !companion.isSyncedWithMain && <span className="absolute -bottom-5 left-0 text-[9px] text-red-500 font-bold">4자리 필수</span>}
                        </div>
                        <div className="relative">
                          <input type="text" placeholder="0000" value={companion.phone3} onChange={(e) => updateCompanion(companion.id, 'phone3', e.target.value)} className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] bg-white px-1 font-black text-center text-[14px] sm:text-[17px] text-slate-900 outline-none ${getPhoneErrorMessage(companion.phone3) ? 'border-red-400' : 'border-[#FFD966]'} ${companion.isSyncedWithMain ? 'opacity-50' : ''}`} disabled={companion.isSyncedWithMain} />
                          {getPhoneErrorMessage(companion.phone3) && !companion.isSyncedWithMain && <span className="absolute -bottom-5 left-0 text-[9px] text-red-500 font-bold">4자리 필수</span>}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-4">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">수령용 이메일 주소</label>
                      <div className="flex gap-1.5 sm:gap-2 items-center w-full">
                        <input 
                          type="text" 
                          placeholder="아이디" 
                          value={companion.emailId} 
                          onChange={(e) => updateCompanion(companion.id, 'emailId', e.target.value)} 
                          className={`flex-[1.4] min-w-0 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-2 sm:px-4 font-black text-[13px] sm:text-[17px] text-slate-900 outline-none focus:border-amber-500 transition-all ${companion.isSyncedWithMain ? 'opacity-50 bg-slate-50' : ''}`} 
                          disabled={companion.isSyncedWithMain} 
                        />
                        <span className="text-slate-400 font-black shrink-0 text-xs sm:text-base px-0.5">@</span>
                        
                        {(!standardDomains.includes(companion.emailDomain) || companion.emailDomain === '직접입력') ? (
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              placeholder="직접입력" 
                              value={companion.emailDomain === '직접입력' ? '' : companion.emailDomain} 
                              onChange={(e) => updateCompanion(companion.id, 'emailDomain', e.target.value)} 
                              className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-2 sm:px-4 font-black text-[12px] sm:text-[17px] text-slate-900 outline-none focus:border-amber-500 transition-all ${companion.isSyncedWithMain ? 'opacity-50 bg-slate-50' : ''}`} 
                              disabled={companion.isSyncedWithMain}
                              autoFocus
                            />
                            {!companion.isSyncedWithMain && (
                              <button 
                                type="button"
                                onClick={() => updateCompanion(companion.id, 'emailDomain', 'naver.com')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-500 font-black shadow-sm"
                              >
                                목록
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 relative">
                            <select 
                              value={companion.emailDomain} 
                              onChange={(e) => updateCompanion(companion.id, 'emailDomain', e.target.value)} 
                              className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-1 sm:px-3 font-bold text-[12px] sm:text-[17px] text-slate-900 outline-none focus:border-amber-500 transition-all appearance-none ${companion.isSyncedWithMain ? 'opacity-50 bg-slate-50' : ''}`} 
                              disabled={companion.isSyncedWithMain}
                            >
                              {emailDomains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {!companion.isSyncedWithMain && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">결과물 수령 방법 <span className="text-red-500">*</span></label>
                      <div className="flex gap-8">
                        {[{ id: 'kakao', label: '카카오톡 수령', icon: '💬' }, { id: 'email', label: '이메일 수령', icon: '📧' }].map(method => (
                          <label key={method.id} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" disabled={companion.isSyncedWithMain} checked={companion.deliveryMethod === method.id} onChange={() => updateCompanion(companion.id, 'deliveryMethod', method.id as any)} className="w-5 h-5 sm:w-6 sm:h-6 accent-blue-600" />
                            <span className={`font-black text-[15px] sm:text-[17px] flex items-center gap-1.5 ${companion.deliveryMethod === method.id ? 'text-blue-600' : 'text-slate-400'}`}>
                              <span>{method.icon}</span> {method.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">상품 선택 <span className="text-red-500">*</span></label>
                      <select value={companion.product} onChange={(e) => updateCompanion(companion.id, 'product', e.target.value)} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white px-3 sm:px-5 font-bold text-[14px] sm:text-[17px] text-slate-900 outline-none appearance-none">
                        <option value="">상품을 선택해주세요</option>
                        <option value="premium">💎 프리미엄 인생 분석서 (120p) - 29,800원</option>
                        <option value="couple">💑 2인 궁합 포함 실속 패키지 - 55,000원</option>
                        <option value="year">📅 2026년 신년운세 집중 리포트 - 19,800원</option>
                      </select>
                      {companion.product === 'couple' && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                           <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={companion.wantsCompatibility} onChange={(e) => updateCompanion(companion.id, 'wantsCompatibility', e.target.checked)} className="w-5 h-5 accent-amber-600 rounded" />
                              <div className="flex flex-col">
                                <span className="font-black text-amber-900 text-[14px] sm:text-[16px]">두 분의 궁합 분석 보고서도 함께 받으시겠습니까?</span>
                                <span className="text-[11px] text-amber-600 font-bold">(패키지 신청 시 무료로 포함되는 혜택입니다)</span>
                              </div>
                           </label>
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[#B84A1A] font-black text-[14px] sm:text-[18px] mb-2">문의 사항 (선택)</label>
                      <textarea placeholder="분석 시 참고했으면 하는 내용이나 궁금한 점을 적어주세요." value={companion.inquiry} onChange={(e) => updateCompanion(companion.id, 'inquiry', e.target.value)} className="w-full h-32 sm:h-40 rounded-xl sm:rounded-2xl border-[2px] border-[#FFD966] bg-white p-5 font-bold text-[14px] sm:text-[16px] text-slate-900 focus:outline-none transition resize-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-12 sm:mb-16">
              <button 
                onClick={() => addCompanion()} 
                disabled={companions.length >= 4}
                className={`w-full h-16 sm:h-20 border-[2px] border-dashed rounded-full font-black text-[16px] sm:text-[20px] flex items-center justify-center gap-3 bg-white shadow-lg transition-all ${companions.length >= 4 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-blue-400 text-blue-500 hover:bg-blue-50'}`}
              >
                <span className="text-xl text-xl sm:text-2xl">{companions.length >= 4 ? '🔒' : '👤+'}</span>
                <span>{companions.length >= 4 ? '최대 인원(4명) 도달' : `동반자 추가하기 (최대 3명 추가 가능: ${companions.length - 1}/3)`}</span>
              </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-[24px] sm:rounded-[40px] border-[3px] border-[#C02128]/10 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between shadow-xl">
                <div className="flex flex-col mb-4 sm:mb-0 text-center sm:text-left">
                  <span className="text-slate-400 text-[12px] sm:text-[16px] font-black uppercase tracking-widest mb-1">Total Payment Amount</span>
                  <span className="text-slate-800 text-[20px] sm:text-[28px] font-black tracking-tighter">총 결제 예정 금액</span>
                </div>
                <div className="text-[#C02128] text-[36px] sm:text-[60px] font-black tracking-tighter leading-none">
                  {getTotalPrice().toLocaleString()}원
                </div>
              </div>

              <div className="bg-[#FFF5F5] rounded-[24px] sm:rounded-[32px] border-[2px] border-[#C02128]/30 p-6 sm:p-8 shadow-lg space-y-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={companions[0]?.isDepositorDifferent} 
                      onChange={(e) => updateCompanion(companions[0]?.id, 'isDepositorDifferent', e.target.checked)} 
                      className="w-6 h-6 sm:w-9 h-9 sm:h-9 accent-[#C02128] rounded-lg flex-shrink-0 cursor-pointer" 
                    />
                  </div>
                  <span className="font-black text-slate-800 text-[16px] sm:text-[23px] tracking-tighter leading-tight group-hover:text-[#C02128] transition-colors">
                    입금자명이 신청인 성함과 다른가요? <span className="text-[#C02128] font-bold text-sm sm:text-2xl ml-1">(타인명의 입금 시 필독)</span>
                  </span>
                </label>

                {companions[0]?.isDepositorDifferent && (
                  <div className="pt-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-white/80 p-4 rounded-2xl mb-4 border border-red-100 flex items-center gap-3 shadow-sm">
                      <span className="text-xl sm:text-3xl">⚠️</span>
                      <p className="text-[#C02128] text-xs sm:text-lg font-black leading-snug">입금 확인이 지연되지 않도록 <span className="underline decoration-red-300">실제 입금하시는 분의 성함</span>을 정확히 입력해주세요.</p>
                    </div>
                    <input 
                      type="text" 
                      placeholder="실제 입금자 성함을 입력하세요 (예: 홍길동)" 
                      value={companions[0]?.depositorName} 
                      onChange={(e) => updateCompanion(companions[0]?.id, 'depositorName', e.target.value)} 
                      className="w-full h-14 sm:h-18 rounded-2xl border-[3px] border-[#C02128] bg-white px-6 font-black text-[18px] sm:text-[26px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 transition shadow-inner placeholder:text-slate-300" 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center px-2">
                <label className="flex items-center gap-3 cursor-pointer group opacity-80 hover:opacity-100 transition-opacity">
                    <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
                    <span className="font-bold text-slate-500 text-[13px] sm:text-[17px] tracking-tight">
                      개인정보 수집 및 분석 이용 약관에 동의합니다 <span className="text-red-500">*</span>
                    </span>
                </label>
              </div>

              <button 
                onClick={handleApplyClick} 
                className="w-full py-8 sm:py-12 text-white bg-[#C02128] rounded-[30px] sm:rounded-full font-black text-[22px] sm:text-[38px] shadow-[0_20px_60px_rgba(192,33,40,0.4)] transition-all transform hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] tracking-tighter"
              >
                사주분석 신청하고 인생지도 받기
              </button>
            </div>
          </>
        )}

        {(step === 'payment' || step === 'confirming') && (
          <div id="payment-info-section" ref={paymentRef} className="bg-transparent space-y-4 sm:space-y-6 animate-in zoom-in-95 duration-700 max-w-xl mx-auto text-center">
            
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-block bg-[#FFF9E5] text-[#D97706] px-4 py-1 rounded-full text-[10px] sm:text-[12px] font-black tracking-[0.2em] uppercase">
                APPLICATION SUCCESS
              </div>
              <h3 className="text-[22px] sm:text-[34px] font-black text-[#1e293b] tracking-tighter leading-tight">
                신청이 정상 접수되었습니다.
              </h3>
              <h4 className="text-[18px] sm:text-[28px] font-black text-[#C02128] tracking-tighter leading-tight">
                입금 완료 확인 후 분석 작업이 시작됩니다.
              </h4>
              <p className="text-slate-400 text-[11px] sm:text-[15px] font-bold tracking-tight px-4 break-keep opacity-80">
                안내된 계좌로 입금해 주시면 입금 확인 즉시 정밀 분석이 진행됩니다.
              </p>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.05)] space-y-6 sm:space-y-8 relative">
              <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-start text-center sm:text-right gap-2 sm:gap-4">
                <span className="text-slate-400 text-[13px] sm:text-[18px] font-black tracking-tight">입금 계좌</span>
                <div className="flex flex-col items-center sm:items-end">
                  <div className="text-[#0f172a] text-[18px] sm:text-[28px] font-black tracking-tighter leading-none mb-1 sm:mb-2">
                    국민은행 774201-01-509358
                  </div>
                  <div className="text-[#B84A1A] text-[12px] sm:text-[20px] font-black italic opacity-90">
                    예금주: 김형감(에이치감유통)
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center text-center sm:text-right gap-1 sm:gap-4">
                <span className="text-slate-400 text-[13px] sm:text-[18px] font-black tracking-tight">최종 결제 금액</span>
                <div className="text-[#C02128] text-[30px] sm:text-[54px] font-black tracking-tighter leading-none">
                  {getTotalPrice().toLocaleString()}원
                </div>
              </div>
            </div>

            <div className="bg-[#FFFCF0] border border-[#FDE68A]/40 rounded-[24px] p-5 sm:p-8 flex gap-3 sm:gap-4 items-start text-left shadow-sm">
               <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-base sm:text-xl shadow-sm flex-shrink-0 border border-slate-50">💡</div>
               <div className="text-[#78350F] text-[12px] sm:text-[17px] font-bold leading-relaxed tracking-tight break-keep">
                 반드시 <span className="text-[#C02128] font-black underline underline-offset-4 decoration-[#C02128]/30">실제 입금자 성함({finalDepositorName})</span>으로 입금 부탁드립니다. 입금 확인 후 <span className="text-[#C02128] font-black">최대 6~12시간 이내</span>에 결과지가 발송됩니다.
               </div>
            </div>

            <div className="pt-1">
              <button 
                onClick={handlePaymentDone}
                disabled={step === 'confirming'}
                className={`w-full py-5 sm:py-8 text-white rounded-[20px] sm:rounded-[28px] font-black text-[18px] sm:text-[28px] shadow-[0_12px_35px_rgba(30,41,59,0.15)] transition-all transform tracking-tighter flex items-center justify-center gap-3 ${step === 'confirming' ? 'bg-slate-400' : 'bg-[#1e293b] hover:bg-[#0f172a] active:scale-[0.97]'}`}
              >
                {step === 'confirming' ? (
                  <>
                    <div className="w-5 h-5 sm:w-7 sm:h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    입금 확인 중...
                  </>
                ) : (
                  '입금을 완료했습니다'
                )}
              </button>
            </div>
          </div>
        )}
        
        {step === 'form' && (
          <div className="rounded-[32px] sm:rounded-[48px] overflow-hidden bg-[#050a14] shadow-xl">
            <EventCountdown />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationForm;
