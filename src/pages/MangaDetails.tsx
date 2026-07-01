import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Manga } from "../types";

const MangaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      mangaService
        .getMangaById(id)
        .then((response) => setManga(response.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading)
    return (
      <div className="text-center text-xl mt-10 text-gray-400">
        Loading details...
      </div>
    );
  if (!manga)
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Manga not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
      <Link
        to="/"
        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-6 inline-block"
      >
        ← Back to Catalog
      </Link>

      <div className="md:flex gap-6 mt-2">
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            {manga.title.en}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Artist:{" "}
            <span className="text-indigo-300 font-semibold">
              {manga.artist.name}
            </span>
          </p>
          <p className="text-gray-300 leading-relaxed bg-gray-900 p-4 rounded-lg border border-gray-700">
            {manga.description?.en}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-2xl font-bold mb-4 text-indigo-400">
          Chapters Available
        </h3>
        {manga.chapters && manga.chapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {manga.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex justify-between items-center bg-gray-900 hover:bg-gray-750 p-4 rounded-lg border border-gray-700 transition"
              >
                <span className="font-semibold text-lg text-white">
                  Chapter {chapter.chapter_number}{" "}
                  {chapter.title && `- ${chapter.title}`}
                </span>
                <Link
                  to={`/manga/${manga.id}/chapter/${chapter.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded font-medium"
                >
                  Read Now
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            No chapters uploaded yet for this manga.
          </p>
        )}
      </div>
    </div>
  );
};

export default MangaDetails;
