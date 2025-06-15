"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AiOutlineMenu, AiOutlineClose, AiFillHome } from "react-icons/ai";
import { BsBook, BsBarChart, BsGear } from "react-icons/bs";

type SidebarProps = {
  isFixed?: boolean;
  toggleButtonPosition?: string;
  toggleButtonColor?: string; // オプショナルで色を渡せる
};

export default function Sidebar({
  isFixed = true,
  toggleButtonPosition = "top-8 left-4",
  toggleButtonColor = "text-white",
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 現在のURL

  const menuItems = [
    { label: "ホーム", icon: <AiFillHome />, path: "/MainScreen" },
    { label: "単語帳", icon: <BsBook />, path: "/MainScreen/WordList" },
    {
      label: "ダッシュボード",
      icon: <BsBarChart />,
      path: "/MainScreen/DashBoard",
    },
    { label: "設定", icon: <BsGear />, path: "" },
  ];

  return (
    <>
      {/* モバイル用トグルボタン */}
      <button
        className={`md:hidden ${isFixed ? "fixed" : "absolute"} z-50 text-3xl ${
          isOpen ? "text-white" : toggleButtonColor
        } ${toggleButtonPosition}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>

      {/* サイドバー */}
      <div
        className={`
          w-64 bg-gray-900 text-white p-6 z-40 transition-transform duration-300 fixed top-0 left-0 h-full md:min-h-screen md:sticky md:top-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <h2 className="mt-16 md:mt-0 text-3xl font-bold mb-8 tracking-tight">
          📚 WordApp
        </h2>
        <ul className="space-y-4">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <li key={index}>
                <a href={item.path}>
                  <div
                    className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer
                ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}
              `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-lg">{item.label}</span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
