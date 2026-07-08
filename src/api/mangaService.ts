import type { Chapter, Manga } from "../types";
import api from "./axios";

export const mangaService = {
  getAllMangas: async (filters?: {
    tags?: number[];
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ data: Manga[] }> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("status", filters.status);
    }

    if (filters?.tags && filters?.tags.length > 0) {
      filters.tags.forEach((tag) => {
        params.append("tags[]", tag.toString());
      });
    }

    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    if (filters?.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }

    const response = await api.get(`/mangas?${params.toString()}`);
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

  getSupportedLocales: async (): Promise<any> => {
    const response = await api.get("/locales");
    return response.data;
  },

  getMangaForEdit: async (id: string): Promise<{ data: any }> => {
    const response = await api.get(`/mangas/${id}/edit`);
    return response.data;
  },

  updateManga: async (
    id: string,
    formData: FormData
  ): Promise<{ data: any }> => {
    const response = await api.post(`/mangas/${id}/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  changeLanguage: (newLanguage: string) => {
    localStorage.setItem("app_locale", newLanguage);
    window.location.reload();
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
