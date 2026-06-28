"use client";

import React from "react";
import { PassState } from "./usePassState.js";
import { useIsFirstRender } from "./useIsFirstRender.js";
import { useInlineEffect } from "./useInlineEffect.js";

export function playAudio(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch((e: any) => {
    if (e.name === "AbortError") return;
    console.log("Play sound failed:", e);
  });
}

export class AudioHandle {
  public audio: HTMLAudioElement;

  constructor(audio: HTMLAudioElement) {
    this.audio = audio;
  }

  public play(src?: string) {
    if (src) {
      this.src = src;
    }
    playAudio(this.audio);
  }
  public pause() {
    this.audio.pause();
  }

  set src(input: string | undefined) {
    this.audio.pause();
    if (!input || !input.length) {
      this.audio.removeAttribute("src");
    } else {
      this.audio.src = input;
    }
    this.audio.load();
  }
  get src(): string | undefined {
    if (!this.audio.src.length) return undefined;
    return this.audio.src;
  }
}

export function useAudio(
  src?: PassState.InitAction<string | undefined>,
  deps?: any[],
): AudioHandle {
  const handle = React.useRef<AudioHandle>(null);
  handle.current ??= new AudioHandle(new Audio(PassState.evalInitAction(src)));

  // Load audio if src change
  const isFirstRender = useIsFirstRender();
  useInlineEffect(() => {
    if (isFirstRender) return;
    handle.current!.src = PassState.evalInitAction(src);
  }, deps ?? []);

  // Clear audio
  React.useEffect(
    () => () => {
      handle.current!.src = undefined;
    },
    [],
  );

  return handle.current;
}
