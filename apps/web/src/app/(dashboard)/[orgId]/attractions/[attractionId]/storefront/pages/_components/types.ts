import type { ContentFormat, PageStatus, PageType } from '@/lib/api/types';

export interface PageFormData {
  slug: string;
  title: string;
  content: string;
  contentFormat: ContentFormat;
  pageType: PageType;
  status: PageStatus;
  showInNav: boolean;
  seo: {
    title: string;
    description: string;
    ogImageUrl: string;
  };
}
