// =============================================================================
// Storefront Types
// =============================================================================

export type ContentFormat = 'markdown' | 'html' | 'plain';
export type PageType =
  | 'home'
  | 'about'
  | 'faq'
  | 'contact'
  | 'rules'
  | 'jobs'
  | 'gallery'
  | 'custom';
export type PageStatus = 'draft' | 'published' | 'archived';
export type DomainType = 'subdomain' | 'custom';
export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'expired';
export type SslStatus = 'pending' | 'provisioning' | 'active' | 'failed' | 'expired';
export type VerificationMethod = 'dns_txt' | 'dns_cname' | 'file';
export type NavLinkType = 'home' | 'page' | 'tickets' | 'attractions' | 'faq' | 'external';
export type NavPosition = 'header' | 'footer';
export type AnnouncementPosition = 'banner' | 'popup' | 'inline';
export type AnnouncementType = 'info' | 'warning' | 'critical' | 'success' | 'promo';

// =============================================================================
// Settings DTOs
// =============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class HeroConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;
}

class ThemeConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preset?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Header/navigation background color' })
  @IsOptional()
  @IsString()
  headerBgColor?: string;

  @ApiPropertyOptional({ description: 'Header/navigation text color' })
  @IsOptional()
  @IsString()
  headerTextColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontHeading?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontBody?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCss?: string;
}

class SocialLinksDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tiktok?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  youtube?: string;
}

class SeoConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImageUrl?: string;
}

class AnalyticsConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customHeadScripts?: string;
}

class FeaturesConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAttractions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showCalendar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showFaq?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showReviews?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  featuredAttractionIds?: string[];
}

export class UpdateStorefrontSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroConfigDto)
  hero?: HeroConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeConfigDto)
  theme?: ThemeConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social?: SocialLinksDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoConfigDto)
  seo?: SeoConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AnalyticsConfigDto)
  analytics?: AnalyticsConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesConfigDto)
  features?: FeaturesConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;
}

// =============================================================================
// Page DTOs
// =============================================================================

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ['markdown', 'html', 'plain'] })
  @IsOptional()
  @IsString()
  content_format?: ContentFormat;

  @ApiPropertyOptional({
    enum: ['home', 'about', 'faq', 'contact', 'rules', 'jobs', 'gallery', 'custom'],
  })
  @IsOptional()
  @IsString()
  page_type?: PageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  show_in_nav?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoConfigDto)
  seo?: SeoConfigDto;
}

export class UpdatePageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ['markdown', 'html', 'plain'] })
  @IsOptional()
  @IsString()
  content_format?: ContentFormat;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsString()
  status?: PageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  show_in_nav?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoConfigDto)
  seo?: SeoConfigDto;
}

// =============================================================================
// Domain DTOs
// =============================================================================

export class AddDomainDto {
  @ApiProperty({ example: 'nightmaremanor.com' })
  @IsString()
  @MaxLength(255)
  domain!: string;
}

// =============================================================================
// FAQ DTOs
// =============================================================================

export class CreateFaqDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  question!: string;

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

export class UpdateFaqDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}

export class ReorderFaqsDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  order!: string[];
}

// =============================================================================
// Announcement DTOs
// =============================================================================

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'critical', 'success', 'promo'] })
  @IsOptional()
  @IsString()
  type?: AnnouncementType;

  @ApiPropertyOptional({ enum: ['banner', 'popup', 'inline'] })
  @IsOptional()
  @IsString()
  position?: AnnouncementPosition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  link_text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  starts_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ends_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dismissible?: boolean;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'critical', 'success', 'promo'] })
  @IsOptional()
  @IsString()
  type?: AnnouncementType;

  @ApiPropertyOptional({ enum: ['banner', 'popup', 'inline'] })
  @IsOptional()
  @IsString()
  position?: AnnouncementPosition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  link_text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  starts_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ends_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dismissible?: boolean;
}

// =============================================================================
// Navigation DTOs
// =============================================================================

class NavItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  label!: string;

  @ApiProperty({ enum: ['home', 'page', 'tickets', 'attractions', 'external'] })
  @IsString()
  link_type!: NavLinkType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  external_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  open_in_new_tab?: boolean;
}

export class UpdateNavigationDto {
  @ApiProperty({ type: [NavItemDto] })
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  header!: NavItemDto[];

  @ApiProperty({ type: [NavItemDto] })
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  footer!: NavItemDto[];
}

// =============================================================================
// Response Types
// =============================================================================

export interface HeroConfigResponse {
  imageUrl: string | null;
  videoUrl: string | null;
  title: string | null;
  subtitle: string | null;
}

export interface ThemeConfigResponse {
  preset: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  headerBgColor: string | null;
  headerTextColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
  customCss: string | null;
}

export interface SocialConfigResponse {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export interface SeoConfigResponse {
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  ogImageUrl: string | null;
}

export interface AnalyticsConfigResponse {
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  customHeadScripts: string | null;
}

export interface FeaturesConfigResponse {
  showAttractions: boolean | null;
  showCalendar: boolean | null;
  showFaq: boolean | null;
  showReviews: boolean | null;
  featuredAttractionIds: string[] | null;
}

export interface StorefrontSettingsResponse {
  id: string;
  tagline: string | null;
  description: string | null;
  hero: HeroConfigResponse;
  theme: ThemeConfigResponse;
  social: SocialConfigResponse;
  seo: SeoConfigResponse;
  analytics: AnalyticsConfigResponse;
  features: FeaturesConfigResponse;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface PageSeoResponse {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
}

export interface PageResponse {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  contentFormat: ContentFormat;
  pageType: PageType;
  status: PageStatus;
  showInNav: boolean;
  seo: PageSeoResponse;
  updatedAt: string;
}

export interface DomainResponse {
  id: string;
  domain: string;
  domainType: DomainType;
  isPrimary: boolean;
  status: DomainStatus;
  sslStatus: SslStatus;
  verifiedAt: string | null;
  verification?: {
    method: VerificationMethod;
    recordName: string;
    recordValue: string;
    instructions: string;
  };
}

export interface FaqResponse {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  position: AnnouncementPosition;
  linkUrl: string | null;
  linkText: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  isDismissible: boolean;
}

export interface NavigationResponse {
  header: Array<{
    id: string;
    label: string;
    linkType: NavLinkType;
    pageId: string | null;
    externalUrl: string | null;
    openInNewTab: boolean;
    sortOrder: number;
  }>;
  footer: Array<{
    id: string;
    label: string;
    linkType: NavLinkType;
    pageId: string | null;
    externalUrl: string | null;
    openInNewTab: boolean;
    sortOrder: number;
  }>;
}

// Public storefront response (aggregated, per-attraction)
export interface PublicStorefrontResponse {
  org: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    website: string | null;
    address: {
      line1: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
    };
    phone: string | null;
    email: string | null;
    timezone: string;
  };
  attraction: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  };
  storefront: {
    tagline: string | null;
    description: string | null;
    hero: HeroConfigResponse;
    theme: ThemeConfigResponse;
    social: SocialConfigResponse;
    seo: SeoConfigResponse;
    features: FeaturesConfigResponse;
  };
  navigation: {
    header: Array<{
      label: string;
      type: NavLinkType;
      url: string;
    }>;
    footer: Array<{
      label: string;
      type: NavLinkType;
      url: string;
    }>;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    linkUrl: string | null;
    linkText: string | null;
    isDismissible: boolean;
  }>;
  domain: {
    current: string;
    canonical: string;
  };
}
