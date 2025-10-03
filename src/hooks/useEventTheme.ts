import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EventTheme {
  custom_title?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
}

export const useEventTheme = (eventId: string | null) => {
  const { data: theme } = useQuery({
    queryKey: ['event-theme', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('events')
        .select('custom_title, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_family')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as EventTheme;
    },
    enabled: !!eventId,
  });

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply theme colors to CSS variables
    if (theme.primary_color) {
      const hsl = hexToHSL(theme.primary_color);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--sidebar-primary', hsl);
      root.style.setProperty('--sidebar-ring', hsl);
    }
    if (theme.secondary_color) {
      root.style.setProperty('--secondary', hexToHSL(theme.secondary_color));
    }
    if (theme.accent_color) {
      const hsl = hexToHSL(theme.accent_color);
      root.style.setProperty('--accent', hsl);
      root.style.setProperty('--sidebar-accent', hsl);
    }
    if (theme.background_color) {
      const hsl = hexToHSL(theme.background_color);
      root.style.setProperty('--background', hsl);
      root.style.setProperty('--card', hsl);
      root.style.setProperty('--sidebar-background', hsl);
    }
    if (theme.text_color) {
      const hsl = hexToHSL(theme.text_color);
      root.style.setProperty('--foreground', hsl);
      root.style.setProperty('--card-foreground', hsl);
      root.style.setProperty('--sidebar-foreground', hsl);
    }
    
    // Apply font family
    if (theme.font_family) {
      root.style.setProperty('font-family', theme.font_family);
      document.body.style.fontFamily = theme.font_family;
    }

    // Cleanup function to reset theme on unmount
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--sidebar-background');
      root.style.removeProperty('--sidebar-foreground');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-accent');
      root.style.removeProperty('--sidebar-ring');
      document.body.style.fontFamily = '';
    };
  }, [theme]);

  return theme;
};

// Convert hex color to HSL format
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
