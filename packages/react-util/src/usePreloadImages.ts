"use client";

import React from "react";

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => {
      console.log(`Failed to preload image: ${url}`);
      resolve();
    };
  });
};

export const preloadAllImages = (urls: readonly string[]): Promise<void[]> => {
  return Promise.all(urls.map((url) => preloadImage(url)));
};

export function usePreloadImages(images: readonly string[]): boolean {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const startPreload = async () => {
      await preloadAllImages(images);
      setIsReady(true);
    };
    startPreload();
  }, []);

  return isReady;
}
