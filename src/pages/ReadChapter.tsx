import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Chapter } from "../types";

interface ChapterLink {
  id: number;
  chapter_number: number;
}

const ReadChapter = () => {
  const { mangaId, chapterId } = useParams<{
    mangaId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  // 💡 إصلاح 1: جعل الحالة الافتراضية مصفوفة فارغة لمنع انهيار findIndex
  const [allChapters, setAllChapters] = useState<ChapterLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapterId) {
      setLoading(true);
      setError(null);
      mangaService
        .getChapterById(chapterId)
        .then((response: any) => {
          setChapter(response.data);
          setAllChapters(response.all_chapters || []);

          // 💡 إصلاح 2: إجبار المتصفح على الصعود لأعلى الصفحة فوراً عند الانتقال لفصل جديد 🔝
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load chapter pages.");
        })
        .finally(() => setLoading(false));
    }
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-indigo-400 font-medium animate-pulse">
        Loading Chapter Pages... 📖
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="text-center py-12 text-red-400 bg-gray-950 min-h-screen pt-24">
        {error || "Chapter not found."}
      </div>
    );
  }

  // --- حسابات التنقل الذكي (Navigation Logic المؤمّنة) ---
  const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    if (targetId) {
      navigate(`/manga/${mangaId}/chapter/${targetId}`);
    }
  };

  // 💡 مكون عناصر التحكم مع تحسين التجاوب للهواتف
  const NavigationControls = () => (
    <div className="flex flex-row justify-between items-center bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700 my-6 max-w-3xl mx-auto gap-2 sm:gap-4 w-full">
      {prevChapter ? (
        <Link
          to={`/manga/${mangaId}/chapter/${prevChapter.id}`}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded font-medium transition whitespace-nowrap"
        >
          ← Ch. {prevChapter.chapter_number}
        </Link>
      ) : (
        <button
          disabled
          className="bg-gray-800 text-gray-600 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded font-medium border border-gray-700 cursor-not-allowed whitespace-nowrap"
        >
          First Chapter
        </button>
      )}

      <select
        value={chapter.id}
        onChange={handleDropdownChange}
        className="bg-gray-900 border border-gray-700 text-white p-1.5 sm:p-2 rounded text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-medium cursor-pointer max-w-[120px] sm:max-w-none"
      >
        {allChapters.map((ch) => (
          <option key={ch.id} value={ch.id}>
            Chapter {ch.chapter_number}
          </option>
        ))}
      </select>

      {nextChapter ? (
        <Link
          to={`/manga/${mangaId}/chapter/${nextChapter.id}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded font-medium transition whitespace-nowrap"
        >
          Ch. {nextChapter.chapter_number} →
        </Link>
      ) : (
        <button
          disabled
          className="bg-gray-800 text-gray-600 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded font-medium border border-gray-700 cursor-not-allowed whitespace-nowrap"
        >
          Last Chapter
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 text-white">
      <div className="text-center mb-6">
        <Link
          to={`/manga/${mangaId}`}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-2 inline-block"
        >
          ← Back to Manga Details
        </Link>
        <h1 className="text-3xl font-bold text-white">
          Chapter {chapter.chapter_number}
        </h1>
        {chapter.title?.en && (
          <p className="text-gray-400 mt-1 italic text-sm">
            {chapter.title.en}
          </p>
        )}
      </div>

      <NavigationControls />

      {/* عارض الصور المانغا الطولي المطور */}
      <div className="flex flex-col items-center bg-black rounded-xl border border-gray-800 shadow-2xl space-y-0.5 max-w-2xl mx-auto overflow-hidden">
        {chapter.pages && chapter.pages.length > 0 ? (
          chapter.pages.map((page: any, index: number) => (
            <img
              key={page.id}
              src={page.url}
              alt={`Page ${index + 1}`}
              className="w-full h-auto object-contain select-none pointer-events-none block"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // تفعيل منطق الـ Fallback إذا فشلت الـ WebP وجلب الرابط الاحتياطي
                if (page.fallback_url && target.src !== page.fallback_url) {
                  console.warn(
                    `WebP image failed, falling back to original: ${page.fallback_url}`
                  );
                  target.src = page.fallback_url;
                }
              }}
            />
          ))
        ) : (
          <div className="text-center py-20 text-gray-500 text-sm">
            No pages uploaded for this chapter yet.
          </div>
        )}
      </div>

      <NavigationControls />
    </div>
  );
};

export default ReadChapter;
