import * as React from 'react';
import { useIsMobile, useIsTablet, useScreenSize } from './use-mobile';

export interface ResponsiveConfig {
  mobile: any;
  tablet?: any;
  desktop: any;
}

export function useResponsiveValue<T>(config: ResponsiveConfig): T {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) {
    return config.mobile;
  }

  if (isTablet && config.tablet !== undefined) {
    return config.tablet;
  }

  return config.desktop;
}

export function useResponsiveColumns() {
  const { width } = useScreenSize();

  return React.useMemo(() => {
    if (width < 640) return 1; // Mobile
    if (width < 768) return 2; // Small tablet
    if (width < 1024) return 3; // Tablet
    if (width < 1280) return 4; // Small desktop
    return 5; // Large desktop
  }, [width]);
}

export function useResponsiveGridCols() {
  const { width } = useScreenSize();

  return React.useMemo(() => {
    if (width < 640) return 'grid-cols-1';
    if (width < 768) return 'grid-cols-2';
    if (width < 1024) return 'grid-cols-3';
    if (width < 1280) return 'grid-cols-4';
    return 'grid-cols-5';
  }, [width]);
}

export function useAdaptiveLayout() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { width, height } = useScreenSize();

  return React.useMemo(
    () => ({
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      width,
      height,
      // Layout helpers
      containerPadding: isMobile ? 'px-3 py-4' : 'px-4 py-6',
      cardPadding: isMobile ? 'p-3' : 'p-4',
      buttonSize: (isMobile ? 'sm' : 'default') as
        | 'sm'
        | 'default'
        | 'lg'
        | 'icon',
      iconSize: isMobile ? 'h-4 w-4' : 'h-5 w-5',
      textSize: {
        title: isMobile ? 'text-lg' : 'text-2xl',
        subtitle: isMobile ? 'text-sm' : 'text-base',
        body: isMobile ? 'text-sm' : 'text-base',
        caption: 'text-xs',
      },
      spacing: {
        section: isMobile ? 'space-y-4' : 'space-y-6',
        card: isMobile ? 'gap-3' : 'gap-4',
        button: isMobile ? 'gap-1' : 'gap-2',
      },
      // Grid configurations
      statsGrid: isMobile
        ? 'grid-cols-2 gap-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
      contentGrid: isMobile
        ? 'grid-cols-1 gap-4'
        : 'grid-cols-1 lg:grid-cols-2 gap-6',
      // Modal configurations
      modalWidth: isMobile ? 'w-full' : 'max-w-lg',
      modalHeight: isMobile ? 'max-h-[90vh]' : 'auto',
    }),
    [isMobile, isTablet, width, height],
  );
}

export function useBreakpoint() {
  const { width } = useScreenSize();

  return React.useMemo(() => {
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }, [width]);
}

export function useOrientation() {
  const [orientation, setOrientation] = React.useState<
    'portrait' | 'landscape'
  >('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}
