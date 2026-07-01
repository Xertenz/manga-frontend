import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Chapter } from "../types";

interface PageInfo {
  id: number;
  name: string;
  file_name: string;
  order: number;
  url: string;
  fallback_url: string; // الرابط الاحتياطي الجديد 💡
}

interface ChapterInfo {
  id: number;
  chapter_number: number;
  title?: string;
  pages: PageInfo[];
}

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

  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterLink[]>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapterId) {
      mangaService
        .getChapterById(chapterId)
        .then((response: any) => {
          setChapter(response.data);
          setAllChapters(response.all_chapters);
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
      <div className="text-center py-12 text-indigo-400 font-medium">
        Loading Chapter Pages...
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12 text-red-400">Chapter not found.</div>
    );
  }

  // --- حسابات التنقل الذكي (Navigation Logic) ---
  const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    if (targetId) {
      navigate(`/manga/${mangaId}/chapter/${targetId}`);
    }
  };

  // دالة مخصصة لجلب رابط الصورة (تفضل الـ webp المضغوطة وتعود للأصلية كاحتياط)
  /*
  const getPageUrl = (mediaItem: any) => {
    if (
      mediaItem.generated_conversions &&
      mediaItem.generated_conversions.optimized
    ) {
      const baseUrl = "http://localhost:8000/storage";
      return `${baseUrl}/${mediaItem.id}/conversions/${mediaItem.name.replace(
        " ",
        "-"
      )}-optimized.webp`;
    }
    return mediaItem.original_url;
  };
  */

  // مكون شريط التنقل (Navigation Bar Component) المكرر أعلى وأسفل الصور
  const NavigationControls = () => (
    <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700 my-6 max-w-3xl mx-auto gap-4">
      {/* زر الفصل السابق */}
      {prevChapter ? (
        <Link
          to={`/manga/${mangaId}/chapter/${prevChapter.id}`}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded font-medium transition"
        >
          ← Prev Ch. {prevChapter.chapter_number}
        </Link>
      ) : (
        <button
          disabled
          className="bg-gray-800 text-gray-600 text-sm px-4 py-2 rounded font-medium border border-gray-700 cursor-not-allowed"
        >
          Start of Manga
        </button>
      )}

      {/* قائمة الانتقال السريع المنسدلة */}
      <select
        value={chapter.id}
        onChange={handleDropdownChange}
        className="bg-gray-900 border border-gray-700 text-white p-2 rounded text-sm focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
      >
        {allChapters.map((ch) => (
          <option key={ch.id} value={ch.id}>
            Chapter {ch.chapter_number}
          </option>
        ))}
      </select>

      {/* زر الفصل التالي */}
      {nextChapter ? (
        <Link
          to={`/manga/${mangaId}/chapter/${nextChapter.id}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded font-medium transition"
        >
          Next Ch. {nextChapter.chapter_number} →
        </Link>
      ) : (
        <button
          disabled
          className="bg-gray-800 text-gray-600 text-sm px-4 py-2 rounded font-medium border border-gray-700 cursor-not-allowed"
        >
          End of Manga
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* رأس الصفحة */}
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
        {chapter.title && (
          <p className="text-gray-400 mt-1 italic">{chapter.title}</p>
        )}
      </div>

      {/* عناصر التحكم العلوية */}
      <NavigationControls />

      {/* مجلد وعارض الصور الطولي */}
      <div className="flex flex-col items-center bg-black p-2 md:p-6 rounded-xl border border-gray-800 shadow-2xl space-y-1 max-w-3xl mx-auto">
        {chapter.pages && chapter.pages.length > 0 ? (
          chapter.pages.map((page: any, index: number) => (
            <img
              key={page.id}
              //src={getPageUrl(page)}
              src={page.url}
              alt={`Page ${index + 1}`}
              className="w-full h-auto object-contain select-none pointer-events-none"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== page.fallback_url) {
                  console.warn(
                    `WebP image failed, falling back to original: ${page.url}`
                  );
                  target.src = page.fallback_url;
                }
              }}
            />
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            No pages uploaded for this chapter yet.
          </div>
        )}
      </div>

      {/* عناصر التحكم السفلية لراحة القارئ بعد إنهاء القراءة */}
      <NavigationControls />
    </div>
  );
};

export default ReadChapter;
