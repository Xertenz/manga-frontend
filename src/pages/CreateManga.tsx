import React, { useState, useEffect } from "react";
import { mangaService } from "../api/mangaService";

// تعريف واجهة البيانات الخاصة بالوسم القادم من الـ API
interface TagOption {
  id: number;
  type: "genre" | "theme" | "format";
  name: { [key: string]: string }; // كائن يحتوي التراجم مثل {"en": "Action", "ar": "أكشن"}
}

export function CreateManga() {
  // 1. الـ States الأساسية السابقة
  const [lang, setLang] = useState("en");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // 2. الـ States الجديدة الخاصة بنظام الأوسمة 🏷️
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [fetchingTags, setFetchingTags] = useState(true);

  // حالات النظام والواجهة
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<any>(null);

  // 3. جلب الأوسمة من الباكيند بمجرد فتح الصفحة
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await mangaService.getAvailableTags();
        setAvailableTags(response.data || response);
      } catch (error) {
        console.error("Failed to load tags", error);
      } finally {
        setFetchingTags(false);
      }
    }
    fetchTags();
  }, []);

  // 4. دالة التبديل عند الضغط على وسم (إضافة / إزالة)
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(
      (prevIds) =>
        prevIds.includes(tagId)
          ? prevIds.filter((id) => id !== tagId) // إزالة إذا كان مختاراً مسبقاً
          : [...prevIds, tagId] // إضافة إذا لم يكن مختاراً
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors(null);

    const formData = new FormData();
    formData.append("lang", lang);
    formData.append("title", title);

    if (description.trim()) {
      formData.append("description", description);
    }

    formData.append("status", status);

    if (coverFile) {
      formData.append("cover", coverFile);
    }

    // 5. تمرير مصفوفة الأوسمة المختارة إلى FormData 🚀
    // لارافيل يتوقع مصفوفة، لذا نرسلها على هيئة مفاتيح متسلسلة مثل tags[]
    selectedTagIds.forEach((id) => {
      formData.append("tags[]", id.toString());
    });

    try {
      await mangaService.uploadManga(formData);
      setMessage(
        "Manga created successfully with the selected translation and tags!"
      );

      // تفريغ الحقول بعد النجاح
      setTitle("");
      setDescription("");
      setCoverFile(null);
      setSelectedTagIds([]); // تصفية الأوسمة المختارة
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setMessage("Validation failed. Please check the inputs.");
      } else {
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لتجميع الأوسمة حسب نوعها لفرزها بالواجهة
  const renderTagGroup = (
    type: "genre" | "theme" | "format",
    label: string
  ) => {
    const filteredTags = availableTags.filter((t) => t.type === type);
    if (filteredTags.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </h4>
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            // جلب اسم الوسم بناءً على اللغة المعروضة حالياً بالموقع أو لغة الإدخال
            const tagName = tag.name[lang] || tag.name["en"];

            return (
              <button
                key={tag.id}
                type="button" // لمنع عمل submit للفورم عند الضغط على الكبسولة ⚠️
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                {tagName}
                {isSelected && <span className="ml-1 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
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

        {/* حقل العنوان الديناميكي */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Manga Title {lang === "ar" ? "(العنوان بالعربية)" : "(in English)"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        {/* حقل الأوسمة والتصنيفات المطور (Tags Section) 🏷️ */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Manga Tags & Genres (التصنيفات والأوسمة)
          </label>

          {fetchingTags ? (
            <p className="text-xs text-gray-500 animate-pulse">
              Loading platform tags...
            </p>
          ) : (
            <div className="space-y-3">
              {renderTagGroup("genre", "Genres / التصنيفات الفنية")}
              {renderTagGroup("theme", "Themes / الموضوعات")}
              {renderTagGroup("format", "Format / طبيعة وشكل العمل")}
            </div>
          )}
          {errors?.tags && (
            <p className="text-red-500 text-xs mt-1">{errors.tags[0]}</p>
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Publishing..." : "Publish Manga"}
        </button>
      </form>
    </div>
  );
}
