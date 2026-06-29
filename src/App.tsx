import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import MangaList from "./pages/MangaList";
import MangaDetails from "./pages/MangaDetails";
import UploadChapter from "./pages/uploadChapter";
import ReadChapter from "./pages/ReadChapter";
import Login from "./pages/Login";
import { mangaService } from "./api/mangaService";
import { useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("auth_token"));
  const [userName, setUserName] = useState(localStorage.getItem("user_name"));

  const handleLogout = async () => {
    try {
      await mangaService.logout();
    } catch (err) {
      console.error("Backend logout failed or token already invalid:", err);
    } finally {
      localStorage.clear();
      setToken(null);
      setUserName(null);
      window.location.href = "/";
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* شريط التنقل العلوي الموحد (Navbar) */}
        <nav className="bg-gray-800 p-4 border-b border-gray-700 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold tracking-wider text-indigo-400 hover:text-indigo-300 transition"
            >
              MangaVerse
            </Link>

            <div className="flex items-center space-x-4">
              {token ? (
                <>
                  <span className="text-sm text-gray-400">
                    Welcome,{" "}
                    <strong className="text-gray-200">{userName}</strong>
                  </span>
                  <Link
                    to="/upload"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                  >
                    + Upload Chapter
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-400 hover:text-red-300 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded text-sm font-medium transition"
                >
                  Login as Artist
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* محتوى الصفحات المتغيرة */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MangaList />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route
              path="/upload"
              element={
                token ? <UploadChapter /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/manga/:mangaId/chapter/:chapterId"
              element={<ReadChapter />}
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
