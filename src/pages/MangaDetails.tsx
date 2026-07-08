import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Manga } from "../types";

const MangaDetails = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<string>("en"); // لغة تصفح الواجهة الحالية

  useEffect(() => {
    if (id) {
      mangaService
        .getMangaById(id)
        .then((response) => setManga(response.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    console.log(manga);
  }, [manga]);

  if (loading)
    return (
      <div className="text-center text-xl mt-10 text-gray-400 animate-pulse">
        Loading details...
      </div>
    );

  if (!manga)
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Manga not found.
      </div>
    );

  // دالة مساعدة لتحديد لون الكبسولة بحسب نوع الـ Tag لإعطاء مظهر احترافي
  const getTagBadgeStyle = (type: string) => {
    switch (type) {
      case "genre":
        return "bg-indigo-900/40 border-indigo-700 text-indigo-300";
      case "theme":
        return "bg-purple-900/40 border-purple-700 text-purple-300";
      case "format":
        return "bg-amber-900/40 border-amber-700 text-amber-300";
      default:
        return "bg-gray-900/40 border-gray-700 text-gray-300";
    }
  };

  // استخراج النصوص المترجمة بناء على لغة العرض الحالية
  const displayTitle = manga.title || "Untitled";
  const displayDescription = manga.description || "No description available.";

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl my-10 text-white">
      {/* شريط علوي للتحكم بلغة العرض الفورية وتجربة المعمارية المحدثة 💡 */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          ← Back to Catalog
        </Link>
        <div className="bg-gray-900 p-1 rounded border border-gray-700 text-xs">
          <button
            onClick={() => setCurrentLang("en")}
            className={`px-3 py-1 rounded transition ${
              currentLang === "en"
                ? "bg-indigo-600 text-white font-bold"
                : "text-gray-400"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setCurrentLang("ar")}
            className={`px-3 py-1 rounded transition ${
              currentLang === "ar"
                ? "bg-indigo-600 text-white font-bold"
                : "text-gray-400"
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* الهيكل الرئيسي التجاوبي: صورة الغلاف يميناً/يساراً والتفاصيل بجانبها 📸 */}
      <div className="flex flex-col md:flex-row gap-8 items-start mt-2">
        {/* قسم غلاف المانغا المرفوع */}
        <div className="w-full md:w-64 flex-shrink-0 mx-auto md:mx-0">
          <img
            src={manga.cover_url}
            alt={displayTitle}
            className="w-full h-auto rounded-xl border border-gray-700 shadow-lg object-cover transform hover:scale-[1.01] transition duration-200"
          />

          {/* حالة العمل أسفل الغلاف */}
          <div className="mt-3 text-center">
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                manga.status === "ongoing"
                  ? "bg-green-950 border-green-700 text-green-400"
                  : manga.status === "completed"
                  ? "bg-blue-950 border-blue-700 text-blue-400"
                  : "bg-amber-950 border-amber-700 text-amber-400"
              }`}
            >
              {manga.status}
            </span>
          </div>
        </div>

        {/* قسم النصوص والبيانات والأوسمة */}
        <div
          className="flex-1 w-full"
          style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}
        >
          <h2 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-indigo-200">
            {displayTitle}
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            {currentLang === "ar" ? "الرسام:" : "Artist:"}{" "}
            <span className="text-indigo-300 font-semibold">
              {manga.artist?.name || "Unknown Artist"}
            </span>
          </p>

          {/* عرض الأوسمة (Tags & Genres) بشكل تفاعلي مبهر 🏷️ */}
          {manga.tags && manga.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {manga.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`px-3 py-1 text-xs font-medium rounded-full border shadow-sm ${getTagBadgeStyle(
                    tag.type
                  )}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-300 leading-relaxed bg-gray-900 p-4 rounded-lg border border-gray-700 text-sm whitespace-pre-line shadow-inner">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* قسم عرض الفصول المتاحة */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-2xl font-bold mb-4 text-indigo-400">
          Chapters Available
        </h3>

        {manga.chapters && manga.chapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {manga.chapters.map((chapter) => {
              // استخراج عنوان الفصل المترجم
              const chapterTitleText = chapter.title
                ? chapter.title[currentLang] || chapter.title["en"] || ""
                : "";

              return (
                <div
                  key={chapter.id}
                  className="flex justify-between items-center bg-gray-900 hover:bg-gray-750 p-4 rounded-lg border border-gray-700 transition duration-150 shadow-sm hover:shadow-md"
                >
                  <span className="font-semibold text-base sm:text-lg text-white">
                    Chapter {chapter.chapter_number}{" "}
                    {chapterTitleText && (
                      <span className="text-gray-400 text-sm font-normal ml-2">
                        {" "}
                        - {chapterTitleText}
                      </span>
                    )}
                  </span>
                  <Link
                    to={`/manga/${manga.id}/chapter/${chapter.id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm px-4 py-2 rounded font-semibold transition shadow active:scale-[0.98]"
                  >
                    Read Now
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm bg-gray-900/50 p-4 rounded-lg text-center border border-gray-700 border-dashed">
            No chapters uploaded yet for this manga.
          </p>
        )}
      </div>
    </div>
  );
};

export default MangaDetails;
