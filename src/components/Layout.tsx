import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center pb-12">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      </div>

      <main className="w-full">{children}</main>

      <footer className="mt-12 text-gray-400 text-xs text-center px-4 max-w-2xl mx-auto">
        <p>© 2026 OmySaju Lab Myeong-ri Service. All rights reserved.</p>
        <p className="mt-1">본 서비스는 정통 명리학 데이터를 활용한 사주 분석 결과로, 참고용으로만 활용하시기 바랍니다.</p>
      </footer>
    </div>
  );
};

export default Layout;
