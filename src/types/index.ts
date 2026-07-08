export interface Tag {
  id: number;
  type: "genre" | "theme" | "format";
  name: string;
}

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
  title?: {
    [locale: string]: string;
  };
  pages?: Page[];
  create_at: string;
}

export interface Manga {
  id: number;
  title: string;
  description?: string;
  slug: string;
  status: "ongoing" | "completed" | "hiatus";
  artist: Artist;
  cover_url: string;
  tags: Tag[];
  chapters?: Chapter[];
  created_at: string;
}

export interface SupportedLocale {
  code: string;
  name: string;
  native: string;
  dir: string;
}
