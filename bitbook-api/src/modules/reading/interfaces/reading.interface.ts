export interface ReadingBookResponse {
  id: number;
  title: string;
  media: {
    id: number;
    file_url: string;
    img_small: string;
    img_medium: string;
    img_large: string;
  };
}

export interface ReadingProgressResponse {
  id: number;
  title: string;
  media: {
    id: number;
    file_url: string;
    img_small: string;
    img_medium: string;
    img_large: string;
  };
  current_page: number;
  progress: number;
  updated_at: Date;
} 