"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="p-4 flex justify-end">
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-12 text-center">
          {/* Logo */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-600">{t("subtitle")}</p>
          </div>

          {/* Game Mode Buttons */}
          <div
            className="grid md:grid-cols-2 gap-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Solo Mode */}
            <Link
              href="/solo"
              className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-material-2 transition-all duration-300 hover:scale-105 hover:shadow-material-3 hover:border-blue-300"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {t("solo")}
              </h2>
              <p className="text-gray-600 text-sm">{t("soloDescription")}</p>
            </Link>

            {/* With Friends Mode */}
            <Link
              href="/host"
              className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-material-2 transition-all duration-300 hover:scale-105 hover:shadow-material-3 hover:border-purple-300"
            >
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {t("withFriends")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("withFriendsDescription")}
              </p>
            </Link>
          </div>

          {/* How to Play */}
          <div
            className="bg-white rounded-2xl p-6 text-left shadow-material-1 border border-gray-100 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t("howToPlay")}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t("howToPlayDescription")}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
