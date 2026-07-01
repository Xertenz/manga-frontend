import React, { useState } from "react";
import { mangaService } from "../api/mangaService";

export function CreateManga() {
  // 1. تبسيط الـ State لتدعم إدخال لغة واحدة في المرة الواحدة 💡
  const [lang, setLang] = useState("en"); // الافتراضي إنجليزي
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<any>(null); // التقاط الأخطاء الجديدة من لارافيل

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors(null);

    // 2. بناء الـ FormData المتوافق مع معمارية الـ Controller الجديد
    const formData = new FormData();
    formData.append("lang", lang); // إرسال رمز اللغة المختار (en أو ar)
    formData.append("title", title);

    if (description.trim()) {
      formData.append("description", description);
    }

    formData.append("status", status);

    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      await mangaService.uploadManga(formData);
      setMessage("Manga created successfully with the selected translation!");

      // تفريغ الحقول بعد النجاح
      setTitle("");
      setDescription("");
      setCoverFile(null);
    } catch (error: any) {
      if (error.response?.status === 422) {
        // التقاط أخطاء الـ Validation المحدثة (title, lang, cover)
        setErrors(error.response.data.errors);
        setMessage("Validation failed. Please check the inputs.");
      } else {
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-950 text-white rounded-xl border border-gray-800 shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
        Create New Manga
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-center border ${
            errors
              ? "bg-red-900/50 border-red-700 text-red-200"
              : "bg-indigo-900/50 border-indigo-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* حقل اختيار لغة المحتوى الحالي */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Manga Language / لغة المانغا
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:outline-none focus:border-indigo-500 text-indigo-400 font-bold"
          >
            <option value="en">English (الإنجليزية)</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* حقل العنوان الديناميكي المتأثر باتجاه النص */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Manga Title {lang === "ar" ? "(العنوان بالعربية)" : "(in English)"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            // قلب اتجاه الكتابة تلقائياً لليمين إذا كانت اللغة المختارة عربية 🎯
            style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:outline-none focus:border-indigo-500"
            required
          />
          {errors?.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
          )}
        </div>

        {/* حقل الوصف الديناميكي */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description {lang === "ar" ? "(الوصف بالعربية)" : "(in English)"}{" "}
            <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 h-32 focus:outline-none focus:border-indigo-500"
          />
          {errors?.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
          )}
        </div>

        {/* حالة العمل وغلاف المانغا */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Manga Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
            {errors?.cover && (
              <p className="text-red-500 text-xs mt-1">{errors.cover[0]}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Manga"}
        </button>
      </form>
    </div>
  );
}
