
import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function Settings() {
  const { language, setLanguage } = useLanguage();
  const en = language === "en";

  return (
    <main className="language-settings">
      <h1>{en ? "Settings" : "Cài đặt"}</h1>

      <section
        className="language-settings-card"
        data-no-translate
      >
        <h2>
          {en ? "General settings" : "Cài đặt chung"}
        </h2>

        <label htmlFor="language-select">
          {en ? "Language" : "Ngôn ngữ"}
        </label>

        <p>
          {en
            ? "Choose your preferred language for the application."
            : "Chọn ngôn ngữ hiển thị cho ứng dụng."}
        </p>

        <select
          id="language-select"
          value={language}
          onChange={event => setLanguage(event.target.value)}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>

        <p className="language-settings-note">
          {en
            ? "Your preference is saved on this browser."
            : "Lựa chọn được lưu trên trình duyệt này."}
        </p>
      </section>
    </main>
  );
}
