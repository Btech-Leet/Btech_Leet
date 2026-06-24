"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LoadingContextValue = {
  start: () => () => void;
  track: <T>(promise: Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

function shouldTrackFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.keepalive) return false;

  const method =
    init?.method ||
    (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET");

  if (method.toUpperCase() === "HEAD") return false;
  return true;
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isTrackableLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const nextUrl = new URL(anchor.href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (nextUrl.origin !== currentUrl.origin) return false;
  if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return false;

  return true;
}

function RouteCompletionWatcher({ completeNavigation }: { completeNavigation: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const frame = requestAnimationFrame(completeNavigation);
    return () => cancelAnimationFrame(frame);
  }, [completeNavigation, pathname, searchParams]);

  return null;
}

function LeetLoadingBar({ active, completing }: { active: boolean; completing: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-1 overflow-hidden bg-transparent transition-opacity duration-200",
        active || completing ? "opacity-100" : "opacity-0"
      )}
      role="progressbar"
      aria-label="Loading"
      aria-valuetext="Loading"
    >
      <div
        className={cn(
          "h-full rounded-r-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(249,115,22,0.7)]",
          completing ? "leet-progress-complete" : "leet-progress-active"
        )}
      />
    </div>
  );
}

export function LeetLoadingProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationStop = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    let stopped = false;
    setPending((count) => count + 1);

    return () => {
      if (stopped) return;
      stopped = true;
      setPending((count) => Math.max(0, count - 1));
    };
  }, []);

  const track = useCallback(
    async <T,>(promise: Promise<T>) => {
      const stop = start();
      try {
        return await promise;
      } finally {
        stop();
      }
    },
    [start]
  );

  const completeNavigation = useCallback(() => {
    if (!navigationStop.current) return;
    const stop = navigationStop.current;
    navigationStop.current = null;
    stop();
  }, []);

  useEffect(() => {
    if (pending > 0) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (!visible && !showTimer.current) {
        showTimer.current = setTimeout(() => {
          showTimer.current = null;
          setVisible(true);
        }, 120);
      }
      return;
    }

    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }

    if (visible) {
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        hideTimer.current = null;
      }, 260);
    }
  }, [pending, visible]);

  useLayoutEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      if (!shouldTrackFetch(input, init)) {
        return originalFetch(input, init);
      }

      const stop = start();
      try {
        return await originalFetch(input, init);
      } finally {
        stop();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [start]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || !isTrackableLink(anchor)) return;

      navigationStop.current?.();
      navigationStop.current = start();
    };

    const onPopState = () => {
      navigationStop.current?.();
      navigationStop.current = start();
      window.setTimeout(completeNavigation, 900);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      navigationStop.current?.();
      navigationStop.current = null;
    };
  }, [completeNavigation, start]);

  const value = useMemo(() => ({ start, track }), [start, track]);

  return (
    <LoadingContext.Provider value={value}>
      <LeetLoadingBar active={visible} completing={visible && pending === 0} />
      <Suspense fallback={null}>
        <RouteCompletionWatcher completeNavigation={completeNavigation} />
      </Suspense>
      {children}
    </LoadingContext.Provider>
  );
}

export function LeetLoadingFallback({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-gray-950/95 backdrop-blur-xl">
      <div className="relative flex flex-col items-center gap-8">
        {/* Glow behind the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-orange-500/20 dark:bg-orange-600/20 blur-[50px] rounded-full animate-pulse" />
        
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200/50 dark:border-gray-800/50" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-orange-500 dark:border-t-orange-400 animate-spin [animation-duration:1.5s] ease-in-out" />
          <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-amber-500 dark:border-b-amber-400 animate-spin [animation-duration:2.5s] [animation-direction:reverse] ease-in-out" />
          <div className="absolute inset-4 rounded-full border-[3px] border-transparent border-l-yellow-400 dark:border-l-yellow-300 animate-spin [animation-duration:3.5s] ease-linear" />
          
          {/* Logo container */}
          <div className="absolute inset-6 rounded-full overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.4)] dark:shadow-[0_0_60px_rgba(249,115,22,0.2)] bg-white ring-4 ring-white dark:ring-gray-900 transition-all duration-300">
            <Image 
              src="/logo.png" 
              alt="BTech LEET Logo" 
              width={96}
              height={96}
              className="w-full h-full object-cover p-1.5" 
            />
          </div>
        </div>

        {/* Loading text and bar */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <p className="text-sm font-black tracking-[0.25em] uppercase text-orange-600 dark:text-orange-400 animate-pulse">
            {label}
          </p>
          <div className="w-48 h-1 overflow-hidden rounded-full bg-gray-200/50 dark:bg-gray-800/50 shadow-inner">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 leet-progress-active" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function useLeetLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLeetLoading must be used within LeetLoadingProvider");
  return context;
}
