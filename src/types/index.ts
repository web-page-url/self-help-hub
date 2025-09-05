import { z } from 'zod';

// Book schema and types
export const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  year: z.string().optional(),
  tags: z.array(z.string()),
  description: z.string().optional(),
  source: z.enum(["uploaded", "public-domain", "external-link"]).optional(),
  license: z.string().optional(),
  fileId: z.string().optional(),
  coverThumb: z.string().optional(),
  pages: z.number().optional(),
  addedAt: z.number(),
  lastOpenedAt: z.number().optional(),
  progress: z.number().min(0).max(1).optional(),
});

export type Book = z.infer<typeof BookSchema>;

// Annotation schema and types
export const AnnotationSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  page: z.number(),
  type: z.enum(["highlight", "note", "bookmark", "quote"]),
  rects: z.array(z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  })).optional(),
  text: z.string().optional(),
  createdAt: z.number(),
  color: z.string().optional(),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

// Settings schema and types
export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  onboardingComplete: z.boolean(),
  reader: z.object({
    zoom: z.number(),
    spread: z.enum(["single", "double"]),
    lineHeight: z.number(),
    tts: z.boolean(),
  }),
  region: z.string().optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

// Search and filter types
export type SortOption = "added-desc" | "added-asc" | "title-asc" | "title-desc" | "author-asc" | "author-desc" | "progress-desc";
export type ViewMode = "grid" | "list";
export type FilterOptions = {
  tags: string[];
  source?: Book["source"];
  progress?: "unread" | "started" | "finished";
  year?: string;
};

// PDF viewer types
export type PDFViewerState = {
  currentPage: number;
  totalPages: number;
  zoom: number;
  spread: "single" | "double";
  isLoading: boolean;
  error: string | null;
};

// Upload types
export type UploadProgress = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
};

// Search result types
export type SearchResult = {
  id: string;
  type: "book" | "annotation";
  title: string;
  subtitle?: string;
  excerpt?: string;
  score: number;
  bookId?: string;
  page?: number;
};

// Collection types
export type Collection = {
  id: string;
  name: string;
  description?: string;
  bookIds: string[];
  createdAt: number;
  updatedAt: number;
};

// Export/Import types
export type LibraryManifest = {
  version: string;
  books: Omit<Book, 'fileId'>[];
  annotations: Annotation[];
  collections: Collection[];
  settings: Settings;
  exportedAt: number;
};

export type ExportOptions = {
  includeFiles: boolean;
  includeAnnotations: boolean;
  includeCollections: boolean;
};

// UI Component types
export type ThemeMode = "light" | "dark" | "system";

// Animation variants for Framer Motion
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
} as const;
