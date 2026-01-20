import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 */}
        <Route path="/" element={<Home />} />

        {/* ✅ 아래 주소들도 전부 Home과 동일 화면 */}
        <Route path="/event1" element={<Home />} />
        <Route path="/promo1" element={<Home />} />
        <Route path="/landing1" element={<Home />} />
        <Route path="/saju1" element={<Home />} />
        <Route path="/offer1" element={<Home />} />

        {/* 없는 주소는 메인으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
