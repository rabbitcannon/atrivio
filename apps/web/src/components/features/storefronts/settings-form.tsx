'use client';

import {
  BACKGROUND_ATTACHMENT_OPTIONS,
  BACKGROUND_POSITION_OPTIONS,
  BACKGROUND_REPEAT_OPTIONS,
  BACKGROUND_SIZE_OPTIONS,
  getDefaultTheme,
  getThemePreset,
  THEME_CATEGORIES,
  THEME_FONT_OPTIONS,
  THEME_PRESETS,
  type ThemePreset,
} from '@atrivio/shared/constants';
import {
  BarChart3,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect } from '@/lib/api/client';
import type { StorefrontSettings } from '@/lib/api/types';

interface SettingsFormProps {
  orgId: string;
  attractionId: string;
  settings: StorefrontSettings | null;
}

/**
 * Theme preset preview component for the dropdown
 */
function ThemePresetPreview({ preset }: { preset: ThemePreset }) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Color preview dots */}
      <div className="flex gap-1">
        <div
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: preset.colors.primary }}
          title="Primary"
        />
        <div
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: preset.colors.background }}
          title="Background"
        />
        <div
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: preset.colors.accent }}
          title="Accent"
        />
      </div>
      {/* Name and description */}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{preset.name}</div>
        <div className="text-xs text-muted-foreground truncate">{preset.description}</div>
      </div>
    </div>
  );
}

export function StorefrontSettingsForm({ orgId, attractionId, settings }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(settings?.isPublished ?? false);

  // Get initial theme values - use saved values or default preset
  const getInitialTheme = () => {
    const defaultPreset = getDefaultTheme();
    const savedPreset = settings?.theme?.preset;
    const preset = savedPreset && getThemePreset(savedPreset) ? savedPreset : defaultPreset.key;

    return {
      preset,
      primaryColor: settings?.theme?.primaryColor || defaultPreset.colors.primary,
      secondaryColor: settings?.theme?.secondaryColor || defaultPreset.colors.secondary,
      accentColor: settings?.theme?.accentColor || defaultPreset.colors.accent,
      backgroundColor: settings?.theme?.backgroundColor || defaultPreset.colors.background,
      textColor: settings?.theme?.textColor || defaultPreset.colors.text,
      headerBgColor: settings?.theme?.headerBgColor || '',
      headerTextColor: settings?.theme?.headerTextColor || '',
      fontHeading: settings?.theme?.fontHeading || defaultPreset.fonts.heading,
      fontBody: settings?.theme?.fontBody || defaultPreset.fonts.body,
      customCss: settings?.theme?.customCss || '',
      // Background image settings
      backgroundImageUrl: settings?.theme?.backgroundImageUrl || '',
      backgroundPosition: settings?.theme?.backgroundPosition || 'center',
      backgroundSize: settings?.theme?.backgroundSize || 'cover',
      backgroundRepeat: settings?.theme?.backgroundRepeat || 'no-repeat',
      backgroundAttachment: settings?.theme?.backgroundAttachment || 'fixed',
      backgroundOverlay: settings?.theme?.backgroundOverlay || '',
    };
  };

  // Theme state
  const [theme, setTheme] = useState(getInitialTheme);

  // Track if colors have been customized from the preset
  const [isCustomized, setIsCustomized] = useState(false);

  /**
   * Apply a theme preset - updates all colors and fonts
   * Preserves background image and custom CSS
   */
  const applyPreset = useCallback(
    (presetKey: string) => {
      const preset = getThemePreset(presetKey);
      if (!preset) return;

      setTheme((prev) => ({
        preset: presetKey,
        primaryColor: preset.colors.primary,
        secondaryColor: preset.colors.secondary,
        accentColor: preset.colors.accent,
        backgroundColor: preset.colors.background,
        textColor: preset.colors.text,
        headerBgColor: preset.colors.headerBg || '',
        headerTextColor: preset.colors.headerText || '',
        fontHeading: preset.fonts.heading,
        fontBody: preset.fonts.body,
        customCss: prev.customCss, // Preserve custom CSS
        // Preserve background image settings
        backgroundImageUrl: prev.backgroundImageUrl,
        backgroundPosition: prev.backgroundPosition,
        backgroundSize: prev.backgroundSize,
        backgroundRepeat: prev.backgroundRepeat,
        backgroundAttachment: prev.backgroundAttachment,
        backgroundOverlay: prev.backgroundOverlay,
      }));
      setIsCustomized(false);

      toast({
        title: `Applied "${preset.name}" theme`,
        description: 'Colors and fonts updated. Remember to save your changes.',
      });
    },
    [toast]
  );

  /**
   * Reset to current preset's default colors
   */
  const resetToPreset = useCallback(() => {
    applyPreset(theme.preset);
  }, [theme.preset, applyPreset]);

  /**
   * Handle individual color/font changes - marks as customized
   */
  const updateThemeField = useCallback((field: string, value: string) => {
    setTheme((prev) => ({ ...prev, [field]: value }));
    setIsCustomized(true);
  }, []);

  // Get current preset for display
  const currentPreset = getThemePreset(theme.preset);

  // Load ALL Google Fonts for dropdown preview (runs once on mount)
  useEffect(() => {
    const displayFonts = ['Creepster', 'Nosifer', 'Eater', 'Butcherman', 'Metal Mania'];

    const fontFamilies = THEME_FONT_OPTIONS.map((font) => {
      if (displayFonts.includes(font.value)) {
        return `family=${font.value.replace(/ /g, '+')}`;
      }
      return `family=${font.value.replace(/ /g, '+')}:wght@400;500;600;700`;
    }).join('&');

    const linkId = 'storefront-preview-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
    }
  }, []);

  // Hero state
  const [hero, setHero] = useState({
    imageUrl: settings?.hero?.imageUrl || '',
    videoUrl: settings?.hero?.videoUrl || '',
    title: settings?.hero?.title || '',
    subtitle: settings?.hero?.subtitle || '',
  });

  // SEO state
  const [seo, setSeo] = useState({
    title: settings?.seo?.title || '',
    description: settings?.seo?.description || '',
    keywords: settings?.seo?.keywords?.join(', ') || '',
    ogImageUrl: settings?.seo?.ogImageUrl || '',
  });

  // Social state
  const [social, setSocial] = useState({
    facebook: settings?.social?.facebook || '',
    instagram: settings?.social?.instagram || '',
    twitter: settings?.social?.twitter || '',
    tiktok: settings?.social?.tiktok || '',
    youtube: settings?.social?.youtube || '',
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: settings?.analytics?.googleAnalyticsId || '',
    facebookPixelId: settings?.analytics?.facebookPixelId || '',
    customHeadScripts: settings?.analytics?.customHeadScripts || '',
  });

  // General state
  const [general, setGeneral] = useState({
    tagline: settings?.tagline || '',
    description: settings?.description || '',
  });

  // Helper to remove empty string values from an object
  const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of Object.keys(obj) as Array<keyof T>) {
      const value = obj[key];
      if (value !== '' && value !== null && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build payload with only non-empty values
      const payload: Record<string, unknown> = {};

      if (general.tagline) payload['tagline'] = general.tagline;
      if (general.description) payload['description'] = general.description;

      const heroData = cleanObject({
        imageUrl: hero.imageUrl,
        videoUrl: hero.videoUrl,
        title: hero.title,
        subtitle: hero.subtitle,
      });
      if (Object.keys(heroData).length > 0) payload['hero'] = heroData;

      const themeData = cleanObject({
        preset: theme.preset,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        backgroundColor: theme.backgroundColor,
        textColor: theme.textColor,
        headerBgColor: theme.headerBgColor,
        headerTextColor: theme.headerTextColor,
        fontHeading: theme.fontHeading,
        fontBody: theme.fontBody,
        customCss: theme.customCss,
        // Background image settings - allow null to clear
        backgroundImageUrl: theme.backgroundImageUrl || null,
        backgroundPosition: theme.backgroundPosition,
        backgroundSize: theme.backgroundSize,
        backgroundRepeat: theme.backgroundRepeat,
        backgroundAttachment: theme.backgroundAttachment,
        backgroundOverlay: theme.backgroundOverlay || null,
      });
      if (Object.keys(themeData).length > 0) payload['theme'] = themeData;

      const seoData: Record<string, unknown> = {};
      if (seo.title) seoData['title'] = seo.title;
      if (seo.description) seoData['description'] = seo.description;
      if (seo.ogImageUrl) seoData['ogImageUrl'] = seo.ogImageUrl;
      const keywords = seo.keywords
        ? seo.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : [];
      if (keywords.length > 0) seoData['keywords'] = keywords;
      if (Object.keys(seoData).length > 0) payload['seo'] = seoData;

      const socialData = cleanObject({
        facebook: social.facebook,
        instagram: social.instagram,
        twitter: social.twitter,
        tiktok: social.tiktok,
        youtube: social.youtube,
      });
      if (Object.keys(socialData).length > 0) payload['social'] = socialData;

      const analyticsData = cleanObject({
        googleAnalyticsId: analytics.googleAnalyticsId,
        facebookPixelId: analytics.facebookPixelId,
        customHeadScripts: analytics.customHeadScripts,
      });
      if (Object.keys(analyticsData).length > 0) payload['analytics'] = analyticsData;

      await apiClientDirect.patch(
        `/organizations/${orgId}/attractions/${attractionId}/storefront`,
        payload
      );

      toast({
        title: 'Settings saved',
        description: 'Your storefront settings have been updated.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const endpoint = isPublished
        ? `/organizations/${orgId}/attractions/${attractionId}/storefront/unpublish`
        : `/organizations/${orgId}/attractions/${attractionId}/storefront/publish`;

      await apiClientDirect.post(endpoint, {});

      setIsPublished(!isPublished);
      toast({
        title: isPublished ? 'Storefront unpublished' : 'Storefront published',
        description: isPublished
          ? 'Your storefront is now in draft mode.'
          : 'Your storefront is now live and accessible to the public.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: `Error ${isPublished ? 'unpublishing' : 'publishing'} storefront`,
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button
          variant={isPublished ? 'outline' : 'default'}
          onClick={handlePublish}
          disabled={publishing || saving}
        >
          {publishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPublished ? 'Unpublishing...' : 'Publishing...'}
            </>
          ) : isPublished ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleSave} disabled={saving || publishing}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Branding</CardTitle>
              <CardDescription>Customize the look and feel of your storefront</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">General</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={general.tagline}
                      onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                      placeholder="Your scary tagline..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preset">Theme Preset</Label>
                    <Select value={theme.preset} onValueChange={applyPreset}>
                      <SelectTrigger>
                        <SelectValue>
                          {currentPreset && (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: currentPreset.colors.primary }}
                                />
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: currentPreset.colors.background }}
                                />
                              </div>
                              <span>{currentPreset.name}</span>
                              {isCustomized && (
                                <span className="text-xs text-muted-foreground">(customized)</span>
                              )}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="w-80">
                        {THEME_CATEGORIES.map((category) => (
                          <SelectGroup key={category.name}>
                            <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                              {category.name}
                            </SelectLabel>
                            {category.presets.map((presetKey) => {
                              const preset = THEME_PRESETS[presetKey];
                              return (
                                <SelectItem key={presetKey} value={presetKey} className="py-3">
                                  <ThemePresetPreview preset={preset} />
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select a preset to apply colors and fonts automatically
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={general.description}
                    onChange={(e) => setGeneral({ ...general, description: e.target.value })}
                    placeholder="Describe your attraction..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Colors</h3>
                  {isCustomized && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetToPreset}
                      className="text-xs"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset to {currentPreset?.name || 'preset'}
                    </Button>
                  )}
                </div>

                {/* Live Theme Preview */}
                <div
                  className="rounded-lg border overflow-hidden transition-colors"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  {/* Header preview */}
                  <div
                    className="px-4 py-3 border-b flex items-center justify-between"
                    style={{
                      backgroundColor: theme.headerBgColor || theme.backgroundColor,
                      borderColor: `${theme.headerTextColor || theme.textColor}20`,
                    }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: theme.headerTextColor || theme.primaryColor,
                        fontFamily: `'${theme.fontHeading}', system-ui, sans-serif`,
                      }}
                    >
                      Your Attraction
                    </span>
                    <div
                      className="flex gap-2 text-sm"
                      style={{ color: theme.headerTextColor || theme.textColor }}
                    >
                      <span style={{ fontFamily: `'${theme.fontBody}', system-ui, sans-serif` }}>
                        Tickets
                      </span>
                      <span style={{ fontFamily: `'${theme.fontBody}', system-ui, sans-serif` }}>
                        FAQs
                      </span>
                    </div>
                  </div>

                  {/* Hero preview */}
                  <div
                    className="relative h-32 flex items-center justify-center"
                    style={{
                      backgroundColor: theme.secondaryColor,
                      backgroundImage: hero.imageUrl ? `url(${hero.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: hero.imageUrl
                          ? `linear-gradient(to bottom, transparent 0%, ${theme.backgroundColor}dd 100%)`
                          : 'none',
                      }}
                    />
                    <div className="relative text-center px-4">
                      <h3
                        className="text-2xl font-bold mb-1"
                        style={{
                          color: theme.textColor,
                          fontFamily: `'${theme.fontHeading}', system-ui, sans-serif`,
                          textShadow: hero.imageUrl ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                        }}
                      >
                        {hero.title || 'Face Your Fears'}
                      </h3>
                      <p
                        className="text-sm"
                        style={{
                          color: theme.textColor,
                          opacity: 0.8,
                          fontFamily: `'${theme.fontBody}', system-ui, sans-serif`,
                          textShadow: hero.imageUrl ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                        }}
                      >
                        {hero.subtitle || 'A terrifying journey awaits...'}
                      </p>
                    </div>
                  </div>

                  {/* Content preview */}
                  <div className="p-4 space-y-4">
                    {/* Card preview */}
                    <div
                      className="rounded-lg p-3"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      <h4
                        className="font-bold mb-1"
                        style={{
                          color: theme.textColor,
                          fontFamily: `'${theme.fontHeading}', system-ui, sans-serif`,
                        }}
                      >
                        General Admission
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: theme.textColor,
                          opacity: 0.7,
                          fontFamily: `'${theme.fontBody}', system-ui, sans-serif`,
                        }}
                      >
                        Standard entry to the haunted experience
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-bold"
                          style={{
                            color: theme.accentColor,
                            fontFamily: `'${theme.fontBody}', system-ui, sans-serif`,
                          }}
                        >
                          $29.99
                        </span>
                        <div
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: theme.primaryColor,
                            color: '#ffffff',
                            fontFamily: `'${theme.fontBody}', system-ui, sans-serif`,
                          }}
                        >
                          Buy Tickets
                        </div>
                      </div>
                    </div>

                    {/* Font labels */}
                    <div
                      className="flex justify-between text-xs pt-2 border-t"
                      style={{ borderColor: `${theme.textColor}20`, color: theme.textColor, opacity: 0.5 }}
                    >
                      <span>Heading: {theme.fontHeading}</span>
                      <span>Body: {theme.fontBody}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={theme.primaryColor}
                        onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.primaryColor}
                        onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={theme.secondaryColor}
                        onChange={(e) => updateThemeField('secondaryColor', e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.secondaryColor}
                        onChange={(e) => updateThemeField('secondaryColor', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="accentColor"
                        value={theme.accentColor}
                        onChange={(e) => updateThemeField('accentColor', e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.accentColor}
                        onChange={(e) => updateThemeField('accentColor', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="backgroundColor"
                        value={theme.backgroundColor}
                        onChange={(e) => updateThemeField('backgroundColor', e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.backgroundColor}
                        onChange={(e) => updateThemeField('backgroundColor', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="textColor"
                        value={theme.textColor}
                        onChange={(e) => updateThemeField('textColor', e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.textColor}
                        onChange={(e) => updateThemeField('textColor', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Header/Navigation Colors */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Header / Navigation
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="headerBgColor">Header Background</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="headerBgColor"
                          value={theme.headerBgColor || theme.backgroundColor}
                          onChange={(e) => updateThemeField('headerBgColor', e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded border"
                        />
                        <Input
                          value={theme.headerBgColor}
                          onChange={(e) => updateThemeField('headerBgColor', e.target.value)}
                          placeholder={theme.backgroundColor}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use page background
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headerTextColor">Header Text</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="headerTextColor"
                          value={theme.headerTextColor || theme.textColor}
                          onChange={(e) => updateThemeField('headerTextColor', e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded border"
                        />
                        <Input
                          value={theme.headerTextColor}
                          onChange={(e) => updateThemeField('headerTextColor', e.target.value)}
                          placeholder={theme.textColor}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use page text color
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Typography</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fontHeading">Heading Font</Label>
                    <Select
                      value={theme.fontHeading}
                      onValueChange={(v) => updateThemeField('fontHeading', v)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <span style={{ fontFamily: `'${theme.fontHeading}', system-ui` }}>
                            {theme.fontHeading}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs uppercase tracking-wider">
                            Sans-serif
                          </SelectLabel>
                          {THEME_FONT_OPTIONS.filter((f) => f.category === 'sans-serif').map(
                            (opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span style={{ fontFamily: `'${opt.value}', system-ui` }}>
                                  {opt.label}
                                </span>
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs uppercase tracking-wider">
                            Serif
                          </SelectLabel>
                          {THEME_FONT_OPTIONS.filter((f) => f.category === 'serif').map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span style={{ fontFamily: `'${opt.value}', serif` }}>
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs uppercase tracking-wider">
                            Horror / Display
                          </SelectLabel>
                          {THEME_FONT_OPTIONS.filter((f) => f.category === 'horror').map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span style={{ fontFamily: `'${opt.value}', cursive` }}>
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontBody">Body Font</Label>
                    <Select
                      value={theme.fontBody}
                      onValueChange={(v) => updateThemeField('fontBody', v)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <span style={{ fontFamily: `'${theme.fontBody}', system-ui` }}>
                            {theme.fontBody}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs uppercase tracking-wider">
                            Sans-serif
                          </SelectLabel>
                          {THEME_FONT_OPTIONS.filter((f) => f.category === 'sans-serif').map(
                            (opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span style={{ fontFamily: `'${opt.value}', system-ui` }}>
                                  {opt.label}
                                </span>
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs uppercase tracking-wider">
                            Serif
                          </SelectLabel>
                          {THEME_FONT_OPTIONS.filter((f) => f.category === 'serif').map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span style={{ fontFamily: `'${opt.value}', serif` }}>
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Use readable fonts for body text
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Hero Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={hero.title}
                      onChange={(e) => setHero({ ...hero, title: e.target.value })}
                      placeholder="Face Your Fears"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      value={hero.subtitle}
                      onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                      placeholder="A terrifying journey awaits..."
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heroImage">Hero Image URL</Label>
                    <Input
                      id="heroImage"
                      value={hero.imageUrl}
                      onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                      placeholder="https://example.com/hero.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1920x1080 or larger
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroVideo">Hero Video URL (optional)</Label>
                    <Input
                      id="heroVideo"
                      value={hero.videoUrl}
                      onChange={(e) => setHero({ ...hero, videoUrl: e.target.value })}
                      placeholder="https://example.com/hero.mp4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Background video for the hero
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Background Image</h3>
                  </div>
                  {theme.backgroundImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateThemeField('backgroundImageUrl', '')}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add a background image to your storefront. Free tiers can link external images.
                  Pro and Enterprise tiers can upload images via the Media library.
                </p>

                {/* Background Image Preview */}
                {theme.backgroundImageUrl && (
                  <div
                    className="rounded-lg border overflow-hidden h-32 relative"
                    style={{
                      backgroundImage: `url(${theme.backgroundImageUrl})`,
                      backgroundPosition: theme.backgroundPosition.replace('-', ' '),
                      backgroundSize: theme.backgroundSize,
                      backgroundRepeat: theme.backgroundRepeat,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    {theme.backgroundOverlay && (
                      <div
                        className="absolute inset-0"
                        style={{ background: theme.backgroundOverlay }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-sm font-medium px-3 py-1 rounded bg-black/50"
                        style={{ color: theme.textColor }}
                      >
                        Preview
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="backgroundImageUrl">Image URL</Label>
                  <Input
                    id="backgroundImageUrl"
                    value={theme.backgroundImageUrl}
                    onChange={(e) => updateThemeField('backgroundImageUrl', e.target.value)}
                    placeholder="https://example.com/background.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to an external image or use the Media library to upload one.
                  </p>
                </div>

                {theme.backgroundImageUrl && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="backgroundPosition">Position</Label>
                        <Select
                          value={theme.backgroundPosition}
                          onValueChange={(v) => updateThemeField('backgroundPosition', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKGROUND_POSITION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backgroundSize">Size</Label>
                        <Select
                          value={theme.backgroundSize}
                          onValueChange={(v) => updateThemeField('backgroundSize', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKGROUND_SIZE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="backgroundRepeat">Repeat</Label>
                        <Select
                          value={theme.backgroundRepeat}
                          onValueChange={(v) => updateThemeField('backgroundRepeat', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKGROUND_REPEAT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backgroundAttachment">Scroll Behavior</Label>
                        <Select
                          value={theme.backgroundAttachment}
                          onValueChange={(v) => updateThemeField('backgroundAttachment', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKGROUND_ATTACHMENT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div>
                                  <div>{opt.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {opt.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundOverlay">Overlay Color</Label>
                      <Input
                        id="backgroundOverlay"
                        value={theme.backgroundOverlay}
                        onChange={(e) => updateThemeField('backgroundOverlay', e.target.value)}
                        placeholder="rgba(0, 0, 0, 0.5)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add a semi-transparent overlay for better text readability. Example:{' '}
                        <code className="bg-muted px-1 rounded">rgba(0, 0, 0, 0.5)</code> for a
                        50% black overlay.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Custom CSS */}
              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={theme.customCss}
                  onChange={(e) => setTheme({ ...theme, customCss: e.target.value })}
                  placeholder="/* Add custom styles here */"
                  className="font-mono text-sm"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Advanced: Add custom CSS to override default styles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your storefront for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  placeholder="The Haunted Mansion | Nightmare Manor"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">{seo.title.length}/100 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  placeholder="Experience the most terrifying haunted house in the region..."
                  maxLength={300}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {seo.description.length}/300 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={seo.keywords}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                  placeholder="haunted house, halloween, scary, horror"
                />
                <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={seo.ogImageUrl}
                  onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Image shown when sharing on social media. Recommended: 1200x630.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={social.facebook}
                    onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={social.instagram}
                    onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    value={social.twitter}
                    onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={social.tiktok}
                    onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={social.youtube}
                    onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Connect analytics and tracking services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={analytics.googleAnalyticsId}
                    onChange={(e) =>
                      setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">Your GA4 measurement ID</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixel"
                    value={analytics.facebookPixelId}
                    onChange={(e) =>
                      setAnalytics({ ...analytics, facebookPixelId: e.target.value })
                    }
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customScripts">Custom Head Scripts</Label>
                <Textarea
                  id="customScripts"
                  value={analytics.customHeadScripts}
                  onChange={(e) =>
                    setAnalytics({ ...analytics, customHeadScripts: e.target.value })
                  }
                  placeholder="<!-- Add custom tracking scripts here -->"
                  className="font-mono text-sm"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Advanced: Add custom scripts to the &lt;head&gt; section.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
