import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Manga, type Tag } from "../types";

export default function MangaList() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<string>("en");

  // حالات الفلاتر المختارة حالياً
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // 1. جلب الأوسمة المتاحة للموقع مرة واحدة عند التحميل
  useEffect(() => {
    mangaService
      .getAvailableTags()
      .then((res) => setAvailableTags(res.data || res))
      .catch((err) => console.error("Error fetching tags:", err));
  }, []);

  // 2. جلب وتحديث قائمة المانغا كلما تغيرت خيارات الفلترة 🚀
  useEffect(() => {
    setLoading(true);
    mangaService
      .getAllMangas({ status: selectedStatus, tags: selectedTagIds })
      .then((res) => setMangas(res.data))
      .catch((err) => console.error("Error fetching mangas:", err))
      .finally(() => setLoading(false));
  }, [selectedStatus, selectedTagIds]);

  // دالة تبديل اختيار الأوسمة
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    console.log(mangas);
  }, [mangas]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      {/* الشريط العلوي العام */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-gray-850 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Manga Realm
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Explore and read localized manga chapters
          </p>
        </div>

        {/* مفتاح تبديل لغة عرض واجهة الكتالوج */}
        <div className="bg-gray-900 p-1 rounded border border-gray-800 text-xs">
          <button
            onClick={() => setCurrentLang("en")}
            className={`px-3 py-1 rounded transition ${
              currentLang === "en"
                ? "bg-indigo-600 text-white font-bold"
                : "text-gray-500"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setCurrentLang("ar")}
            className={`px-3 py-1 rounded transition ${
              currentLang === "ar"
                ? "bg-indigo-600 text-white font-bold"
                : "text-gray-500"
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 🛠️ لوحة الفلاتر الجانبية التفاعلية (Filter Sidebar) */}
        <div className="lg:col-span-1 bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-6 h-fit">
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              Filter by Status
            </h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              Filter by Tags
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 lg:w-full lg:text-left rounded-lg text-xs font-medium transition border cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <span>{tag.name}</span>
                    <span className="text-[10px] text-gray-500 bg-black/30 px-1.5 py-0.5 rounded uppercase">
                      {tag.type[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer block"
              >
                Clear Tag Filters
              </button>
            )}
          </div>
        </div>

        {/* 🖼️ الـ Grid الرئيسي لعرض كروت المانغا (Manga Catalog Grid) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-24 text-gray-500 text-lg animate-pulse">
              Filtering Realm Database... 🌀
            </div>
          ) : mangas.length === 0 ? (
            <div className="text-center py-24 text-gray-500 border border-gray-800 border-dashed rounded-xl">
              No mangas found matching the active filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {mangas.map((manga) => {
                //const title = manga.title;
                return (
                  <Link
                    to={`/manga/${manga.id}/${manga.slug}`}
                    key={manga.id}
                    className="group bg-gray-900 rounded-xl border border-gray-850 overflow-hidden shadow-md hover:shadow-xl transition duration-200 hover:scale-[1.02] flex flex-col"
                  >
                    {/* غلاف الكارت */}
                    <div className="relative aspect-[2/3] w-full bg-gray-950 overflow-hidden">
                      <img
                        src={manga.cover_url}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {/* بادج الحالة شفاف على الغلاف */}
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          manga.status === "ongoing"
                            ? "bg-green-950/90 text-green-400 border border-green-800"
                            : manga.status === "completed"
                            ? "bg-blue-950/90 text-blue-400 border border-blue-800"
                            : "bg-amber-950/90 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {manga.status}
                      </span>
                    </div>

                    {/* بيانات الكارت النصية أسفل الغلاف */}
                    <div
                      className="p-3 flex flex-col flex-1"
                      style={{
                        direction: currentLang === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <h2 className="font-bold text-sm text-white group-hover:text-indigo-400 transition line-clamp-2 min-h-[40px]">
                        {manga.title}
                      </h2>
                      <p className="text-[11px] text-gray-500 mt-1">
                        By {manga.artist?.name || "Unknown"}
                      </p>

                      {/* لمحة مصغرة عن وسوم المانغا داخل الكارت */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {manga.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="bg-gray-950 text-[9px] px-1.5 py-0.5 rounded border border-gray-800 text-gray-400"
                          >
                            {t.name[currentLang] || t.name["en"]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
