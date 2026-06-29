import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Chapter } from "../types";

const ReadChapter = () => {
  const { mangaId, chapterId } = useParams<{
    mangaId: string;
    chapterId: string;
  }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapterId) {
      mangaService
        .getChapterById(chapterId)
        .then((response) => setChapter(response.data))
        .catch((err) => {
          console.error(err);
          setError("Failed to load chapter pages.");
        })
        .finally(() => setLoading(false));
    }
  }, [chapterId]);

  if (loading)
    return (
      <div className="text-center text-xl mt-10 text-gray-400">
        Loading pages...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 text-xl mt-10">{error}</div>
    );
  if (!chapter || !chapter.pages || chapter.pages.length === 0) {
    return (
      <div className="text-center text-gray-400 text-xl mt-10">
        No pages found for this chapter.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* شريط التحكم العلوي */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6 shadow-md sticky top-0 z-50">
        <Link
          to={`/manga/${mangaId}`}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          ← Back to Manga
        </Link>
        <h2 className="text-xl font-bold text-white text-center">
          Chapter {chapter.chapter_number}{" "}
          {chapter.title && ` - ${chapter.title}`}
        </h2>
        <div className="text-xs text-gray-400">
          Pages: {chapter.pages.length}
        </div>
      </div>

      {/* ساحة عرض الصور (عالم المانغا الطولي) */}
      <div className="flex flex-col items-center bg-black p-2 rounded-lg border border-gray-800 space-y-4 shadow-2xl">
        {chapter.pages
          .sort((a, b) => a.order - b.order) // التأكد من الترتيب الهندسي الصحيح للصفحات
          .map((page) => (
            <div key={page.id} className="w-full relative group">
              <img
                src={page.url}
                alt={`Page ${page.order}`}
                className="w-full h-auto block select-none pointer-events-none"
                loading="lazy" // ميزة برمجية ممتازة لعدم تحميل الصور إلا عند النزول إليها لتوفير البيانات والسرعة
              />
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-gray-450 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">
                Page {page.order}
              </span>
            </div>
          ))}
      </div>

      {/* أزرار التنقل السفلى */}
      <div className="flex justify-center mt-6 p-4">
        <Link
          to="/"
          className="bg-gray-850 hover:bg-gray-700 text-white px-6 py-3 rounded-lg border border-gray-700 font-medium transition"
        >
          Back to Home Catalog
        </Link>
      </div>
    </div>
  );
};

export default ReadChapter;
