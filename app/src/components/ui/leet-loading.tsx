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
          "h-full rounded-r-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.7)]",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-violet-500 border-b-emerald-400 animate-spin" />
          <div className="absolute inset-4 flex items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            <span className="text-xl font-black text-white">LEET</span>
          </div>
        </div>
        <div className="w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 leet-progress-active" />
        </div>
        <p className="text-sm font-semibold text-white/80">{label}</p>
      </div>
    </div>
  );
}

export function useLeetLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLeetLoading must be used within LeetLoadingProvider");
  return context;
}
