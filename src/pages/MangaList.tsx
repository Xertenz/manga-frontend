import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mangaService } from "../api/mangaService";
import { type Manga } from "../types";

const MangaList = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await mangaService.getAllMangas();
        setMangas(response.data);
      } catch (err) {
        setError("Failed to load manga catalog. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

  if (loading)
    return (
      <div className="text-center text-xl mt-10 text-gray-400">
        Loading catalog...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 text-xl mt-10">{error}</div>
    );

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-indigo-400">
        Latest Manga Updates
      </h2>

      {mangas.length === 0 ? (
        <p className="text-gray-400 text-center text-lg">
          No manga available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mangas.map((manga) => (
            <div
              key={manga.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500 transition duration-300"
            >
              <div className="p-5">
                <span
                  className={`text-xs font-bold uppercase px-2 py-1 rounded float-right ${
                    manga.status === "ongoing"
                      ? "bg-green-900 text-green-300"
                      : "bg-blue-900 text-blue-300"
                  }`}
                >
                  {manga.status}
                </span>
                <h3 className="text-xl font-bold mt-2 truncate text-white">
                  {manga.title.en}
                </h3>
                <p className="text-gray-400 text-sm mt-2 line-clamp-3">
                  {manga.description?.en}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
                  <span>
                    By:{" "}
                    <strong className="text-indigo-300">
                      {manga.artist ? manga.artist.name : "Unknown"}
                    </strong>
                  </span>
                </div>
                <Link
                  to={`/manga/${manga.id}`}
                  className="block text-center mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaList;
