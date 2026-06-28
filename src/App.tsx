import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MangaList from "./pages/MangaList";
import MangaDetails from "./pages/MangaDetails";
import UploadChapter from "./pages/uploadChapter";
import ReadChapter from "./pages/ReadChapter";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* شريط التنقل العلوي الموحد (Navbar) */}
        <nav className="bg-gray-800 p-4 border-b border-gray-700 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider text-indigo-400">
              MangaVerse
            </h1>
          </div>
        </nav>

        {/* محتوى الصفحات المتغيرة */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MangaList />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/upload" element={<UploadChapter />} />
            <Route
              path="/manga/:mangaId/chapter/:chapterId"
              element={<ReadChapter />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
