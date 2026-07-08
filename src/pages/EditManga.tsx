import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import type { SupportedLocale, Tag } from "../types";

export function EditManga() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // الحقول الأساسية
  const [supportedLocales, setSupportedLocales] = useState<SupportedLocale[]>(
    []
  );
  const [lang, setLang] = useState("en"); // اللغة التي يتم تعديلها حالياً

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // نظام الأوسمة
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // حالات التحميل والنظام
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<any>(null);

  // 1. جلب البيانات الأساسية والأوسمة المتاحة عند تحميل الصفحة لأول مرة
  useEffect(() => {
    async function initPage() {
      try {
        // جلب الأوسمة المتاحة بالمنصة
        const tagsResponse = await mangaService.getAvailableTags();
        setAvailableTags(tagsResponse.data);

        const localesResponse = await mangaService.getSupportedLocales();
        setSupportedLocales(localesResponse.data);

        // جلب بيانات المانغا الحالية باللغة الافتراضية المحددة (en مثلاً)
        await fetchMangaData();
      } catch (error) {
        console.error("Initialization failed", error);
        setMessage("Failed to load manga data.");
      } finally {
        setPageLoading(false);
      }
    }
    if (id) initPage();
  }, [id]);

  useEffect(() => {
    console.log(availableTags);
  }, [availableTags]);

  // 2. دالة مستقلة لجلب بيانات المانغا بناءً على اللغة المختارة
  // هذا يسمح لنا بتحديث الحقول (العنوان والوصف) فوراً عند تبديل اللغة دون تصفير بقية الفورم!
  const fetchMangaData = async () => {
    if (!id) return;
    try {
      // نرسل اللغة المطلوبة للباكيند عبر Header أو Query Parameter ليجلب الترجمة المناسبة
      const response = await mangaService.getMangaForEdit(id);
      const manga = response.data;
      console.log(manga);
      if (!manga) {
        navigate("/");
        return;
      }

      /*
      const { manga, supported_locales } = response;
      setSupportedLocales(supported_locales);
      */

      // تحديث النصوص بناءً على اللغة المجلوبة
      setTitle(manga.title || "");
      setDescription(manga.description || "");

      // تحديث بقية البيانات الثابتة (الحالة، الغلاف، الأوسمة المختارة)
      setStatus(manga.status);
      setCurrentCoverUrl(manga.cover_url || null);

      // استخراج الـ IDs للأوسمة المربوطة بالمانغا حالياً
      if (manga.tags) {
        setSelectedTagIds(manga.tags.map((t: any) => t.id));
      }
    } catch (error) {
      console.error("Failed to fetch manga translation", error);
    }
  };

  // 3. مراقبة تغير اللغة لجلب نصوص الترجمة الخاصة بها ديناميكياً
  const handleLangChange = async (newLang: string) => {
    setLang(newLang);
    /*
    setLoading(true);
    await fetchMangaData(newLang);
    setLoading(false);
    */
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prevIds) =>
      prevIds.includes(tagId)
        ? prevIds.filter((id) => id !== tagId)
        : [...prevIds, tagId]
    );
  };

  // 4. دالة الحفظ وإرسال التعديلات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setMessage("");
    setErrors(null);

    const formData = new FormData();
    // 💡 حل خدعة لارافيل: نرسلها كـ POST ونمرر حقل المحاكاة لـ PUT
    formData.append("_method", "PUT");

    formData.append("lang", lang);
    formData.append("title", title);

    if (description.trim()) {
      formData.append("description", description);
    }

    formData.append("status", status);

    // نرفع الغلاف الجديد فقط إذا قام المستخدم باختياره
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    selectedTagIds.forEach((tagId) => {
      formData.append("tags[]", tagId.toString());
    });

    try {
      // نرسل الطلب كـ POST (ولارافيل سيعامله كـ PUT بفضل الـ _method)
      const response = await mangaService.updateManga(id, formData);
      console.log(response);
      setMessage("Manga updated successfully!");

      // تحديث رابط الغلاف المعروض إذا كان قد تغير
      if (coverFile) {
        setCoverFile(null);
        // إعادة جلب البيانات لتحديث الـ cover_url الحقيقي من السيرفر
        //fetchMangaData(lang);
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setMessage("Validation failed. Please check your entries.");
      } else {
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

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
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                {tag.name}
                {isSelected && <span className="ml-1 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-indigo-400 animate-pulse text-lg font-medium">
          Loading Manga Data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-950 text-white rounded-xl border border-gray-800 shadow-xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Edit Manga</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
      </div>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-center border ${
            errors
              ? "bg-red-900/50 border-red-700 text-red-200"
              : "bg-indigo-900/50 border-indigo-700 text-indigo-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* حقل اختيار وتعديل اللغة ديناميكياً */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Editing Language / تعديل لغة
          </label>
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:outline-none focus:border-indigo-500 text-indigo-400 font-bold"
          >
            {supportedLocales.map((supportedLocale) => (
              <option value={supportedLocale.code} key={supportedLocale.code}>
                {supportedLocale.name} ({supportedLocale.native})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            * التبديل بين اللغات يتيح لك تعديل أو إضافة ترجمة المانغا لهذه اللغة
            تحديداً دون التأثير على الأوسمة والحالة.
          </p>
        </div>

        {/* حقل العنوان */}
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

        {/* حقل الوصف */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description {lang === "ar" ? "(الوصف بالعربية)" : "(in English)"}
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

        {/* قسم الأوسمة والتصنيفات */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Manga Tags & Genres
          </label>
          <div className="space-y-3">
            {renderTagGroup("genre", "Genres / التصنيفات الفنية")}
            {renderTagGroup("theme", "Themes / الموضوعات")}
            {renderTagGroup("format", "Format / طبيعة العمل")}
          </div>
          {errors?.tags && (
            <p className="text-red-500 text-xs mt-1">{errors.tags[0]}</p>
          )}
        </div>

        {/* الحالة والغلاف */}
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
              Update Cover Image
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

        {/* عرض الغلاف الحالي للمانغا إن وجد كمرجع بصري للمسؤول */}
        {currentCoverUrl && !coverFile && (
          <div className="mt-2 p-2 bg-gray-900 rounded-lg border border-gray-800 flex items-center gap-3">
            <img
              src={currentCoverUrl}
              alt="Current Cover"
              className="w-12 h-16 object-cover rounded shadow"
            />
            <span className="text-xs text-gray-400">
              Current Cover Image Active
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
