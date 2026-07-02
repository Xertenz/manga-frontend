import type { Chapter, Manga } from "../types";
import api from "./axios";

export const mangaService = {
  getAllMangas: async (): Promise<{ data: Manga[] }> => {
    const response = await api.get("/mangas");
    return response.data;
  },

  getMangaById: async (id: number | string): Promise<{ data: Manga }> => {
    const response = await api.get(`/mangas/${id}`);
    return response.data;
  },

  uploadManga: async (formData: FormData): Promise<any> => {
    const response = await api.post("/mangas", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadChapter: async (formData: FormData): Promise<any> => {
    const response = await api.post("/chapters", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getChapterById: async (id: string | number): Promise<{ data: Chapter }> => {
    const response = await api.get(`/chapters/${id}`);
    return response.data;
  },

  getAvailableTags: async (): Promise<any> => {
    const response = await api.get("/tags");
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<any> => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  logout: async (): Promise<any> => {
    const response = await api.post("/logout");
    return response.data;
  },
};
