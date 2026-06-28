export interface Artist {
  id: number;
  name: string;
}

export interface Page {
  id: number;
  file_name: string;
  order: number;
  url: string;
}

export interface Chapter {
  id: number;
  chapter_number: number;
  title: string | null;
  pages?: Page[];
  create_at: string;
}

export interface Manga {
  id: number;
  title: string;
  description: string;
  status: "ongoing" | "completed";
  artist: Artist;
  chapters?: Chapter[];
  created_at: string;
}
