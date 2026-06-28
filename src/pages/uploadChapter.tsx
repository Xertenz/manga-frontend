import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Manga } from "../types";

const UploadChapter = () => {
  const navigate = useNavigate();
  const [mangas, setMangas] = useState<Manga[]>([]);

  // حقول الفورم
  const [selectedMangaId, setSelectedMangaId] = useState<string>("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

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
      setSelectedFiles(e.target.files);
    }
  };

  // إرسال البيانات للـ Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !chapterNumber || !selectedFiles) {
      setError("Please fill in all required fields and select pages.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // بناء كائن FormData البرمجي
    const formData = new FormData();
    formData.append("manga_id", selectedMangaId.toString());
    formData.append("chapter_number", chapterNumber.toString());
    if (chapterTitle.trim()) formData.append("title", chapterTitle.trim());

    // إضافة مصفوفة الصور بنفس الاسم المتوقع في لارافيل 'pages[]'
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("pages[]", selectedFiles[i]);
    }

    try {
      await mangaService.uploadChapter(formData);
      setMessage("Chapter and pages uploaded successfully!");
      // إعادة تهيئة الحقول بعد النجاح
      setChapterNumber("");
      setChapterTitle("");
      setSelectedFiles(null);

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
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
          >
            {mangas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* 2. رقم الفصل */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chapter Number *
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 1 or 2.5"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* 3. عنوان الفصل */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chapter Title (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Romance Dawn"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* 4. رفع الصفحات */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Manga Pages * (Select multiple images)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-900 file:text-indigo-300 hover:file:bg-indigo-800"
            required
          />
          {selectedFiles && (
            <p className="text-xs text-indigo-400 mt-2">
              Selected: {selectedFiles.length} pages ready to upload.
            </p>
          )}
        </div>

        {/* زر الرفع */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
        >
          {loading ? "Uploading & Processing Images..." : "Publish Chapter"}
        </button>
      </form>
    </div>
  );
};

export default UploadChapter;
