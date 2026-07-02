import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSortable } from "react-sortablejs";
import { mangaService } from "../api/mangaService";
import { type Manga } from "../types";

interface SortableFile {
  id: string;
  file: File;
  preview: string;
}

const UploadChapter = () => {
  const navigate = useNavigate();
  const [mangas, setMangas] = useState<Manga[]>([]);

  // حقول الفورم
  const [selectedMangaId, setSelectedMangaId] = useState<string>("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [lang, setLang] = useState<string>("en"); // 💡 حقل اللغة المضاف ليتوافق مع الباكيند الجديد
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [sortableFiles, setSortableFiles] = useState<SortableFile[]>([]);

  // حالات الواجهة
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingMangas, setFetchingMangas] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // جلب المانغا المتاحة للقائمة المنسدلة عند فتح الصفحة
  useEffect(() => {
    mangaService
      .getAllMangas()
      .then((response) => {
        setMangas(response.data);
        if (response.data.length > 0)
          setSelectedMangaId(response.data[0].id.toString());
      })
      .catch(() => setError("Failed to load manga list."))
      .finally(() => setFetchingMangas(false));
  }, []);

  // معالجة اختيار الملفات
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const mappedFiles = filesArray.map((file) => ({
        id: crypto.randomUUID(),
        file: file,
        preview: URL.createObjectURL(file),
      }));
      setSortableFiles((prevFiles) => [...prevFiles, ...mappedFiles]);
    }
  };

  const handleRemoveImage = (item: SortableFile) => {
    setSortableFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== item.id)
    );
    // تنظيف الـ Memory URL لمنع تسريب الذاكرة (Memory Leaks)
    URL.revokeObjectURL(item.preview);
  };

  // إرسال البيانات للـ Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMangaId || !chapterNumber || sortableFiles.length === 0) {
      setError("Please fill in all required fields and select pages.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // بناء كائن FormData البرمجي المتوافق مع الباكيند المحدث 🚀
    const formData = new FormData();
    formData.append("manga_id", selectedMangaId.toString());
    formData.append("chapter_number", chapterNumber.toString());
    formData.append("lang", lang); // 💡 إرسال رمز اللغة المختار (en أو ar)

    if (chapterTitle.trim()) {
      formData.append("title", chapterTitle.trim());
    }

    // إضافة مصفوفة الصور بالترتيب السحري المحدث بعد السحب والإفلات
    sortableFiles.forEach((item: SortableFile) => {
      formData.append("pages[]", item.file);
    });

    try {
      await mangaService.uploadChapter(formData);
      setMessage("Chapter and pages uploaded successfully!");

      // إعادة تهيئة الحقول بعد النجاح
      setChapterNumber("");
      setChapterTitle("");
      setSortableFiles([]);

      // التوجيه لصفحة تفاصيل المانغا بعد ثانيتين لرؤية الفصل الجديد
      setTimeout(() => navigate(`/manga/${selectedMangaId}`), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during upload."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMangas)
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading upload form...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">
        Upload New Chapter
      </h2>

      {message && (
        <div className="bg-green-950 border border-green-500 text-green-300 p-4 rounded mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-950 border border-red-500 text-red-300 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. اختيار المانغا */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Manga *
          </label>
          <select
            value={selectedMangaId}
            onChange={(e) => setSelectedMangaId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none font-semibold text-indigo-400"
          >
            {mangas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title.en || m.title.ar || `Manga #${m.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 2. رقم الفصل */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chapter Number *
            </label>
            <input
              type="number"
              step="0.01" // للسماح بكسور الفصول الدقيقة مثل 101.55
              placeholder="e.g. 1 or 2.5"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* 3. لغة عنوان الفصل الحالية 💡 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="en">English (الإنجليزية)</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* 4. عنوان الفصل مع اتجاه نص ديناميكي */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chapter Title{" "}
            {lang === "ar" ? "(العنوان بالعربية)" : "(in English)"} (Optional)
          </label>
          <input
            type="text"
            placeholder={
              lang === "ar" ? "مثال: فجر المغامرة" : "e.g. Romance Dawn"
            }
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* حقل اختيار الملفات الحقيقي المخفي وتحته الزر المنسق */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center bg-gray-900/50 hover:border-indigo-500 transition duration-200">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Click here to select chapter pages (Images)
          </label>
          <p className="text-xs text-gray-500 mt-1">
            You can drag and drop to re-order them after selection.
          </p>
        </div>

        {/* منطقة السحب والإفلات ومعاينة الصور الذكية المرتبة */}
        {sortableFiles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Drag & Drop to rearrange pages (
              <strong className="text-indigo-400">
                {sortableFiles.length}
              </strong>{" "}
              pages selected):
            </label>

            <ReactSortable
              list={sortableFiles}
              setList={setSortableFiles}
              animation={200}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700 min-h-37.5"
            >
              {sortableFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="relative group bg-gray-800 border border-gray-700 rounded-lg p-2 cursor-grab active:cursor-grabbing hover:border-indigo-500 transition shadow-md"
                >
                  <img
                    src={item.preview}
                    alt={`page preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded mb-2 pointer-events-none select-none"
                  />
                  {/* رقم الصفحة يترتب تلقائياً وديناميكياً حسب السحب */}
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
                    {index + 1}
                  </div>
                  {/* زر حذف الصورة الفردية في حال الرفع الخطأ */}
                  <div
                    onClick={() => handleRemoveImage(item)}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg cursor-pointer transition duration-150"
                    title="Remove page"
                  >
                    ✕
                  </div>
                  <p className="text-xs text-gray-400 truncate text-center px-1">
                    {item.file.name}
                  </p>
                </div>
              ))}
            </ReactSortable>
          </div>
        )}

        {/* زر الرفع والمعالجة */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200 cursor-pointer disabled:opacity-50"
        >
          {loading
            ? `Uploading & Processing ${sortableFiles.length} Images...`
            : "Publish Chapter"}
        </button>
      </form>
    </div>
  );
};

export default UploadChapter;
