/**
 * Client-side tracking utility for lead source attribution.
 * Captures referrer, current URL, UTM params, and landing page info.
 * Pass the result to the registration API to auto-create a Lead record.
 */

export interface TrackingData {
  sourcePage: string;
  sourceUrl: string;
  landingPage: string;
  referrerPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

/**
 * Extracts UTM parameters from the current URL.
 */
function getUTMParams(): {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
} {
  if (typeof window === "undefined") {
    return { utmSource: "", utmMedium: "", utmCampaign: "" };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };
}

/**
 * Captures the full tracking data from the current page context.
 * Call this when the user lands on the site and store it for later use during registration.
 */
export function captureTrackingData(): TrackingData {
  if (typeof window === "undefined") {
    return {
      sourcePage: "",
      sourceUrl: "",
      landingPage: "",
      referrerPage: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
    };
  }

  const utmParams = getUTMParams();

  return {
    sourcePage: window.location.pathname,
    sourceUrl: window.location.href,
    landingPage: window.location.pathname,
    referrerPage: document.referrer || "",
    ...utmParams,
  };
}

// Storage key for persisting tracking data across pages
const TRACKING_STORAGE_KEY = "btechleet_tracking";

/**
 * Stores tracking data in sessionStorage so it persists across page navigations.
 * Should be called on initial page load (e.g., in a layout component).
 */
export function persistTrackingData(): void {
  if (typeof window === "undefined") return;

  // Only store if not already stored (first page visit in session)
  const existing = sessionStorage.getItem(TRACKING_STORAGE_KEY);
  if (!existing) {
    const data = captureTrackingData();
    sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(data));
  }
}

/**
 * Retrieves the persisted tracking data.
 * Falls back to capturing fresh data if nothing was stored.
 */
export function getTrackingData(): TrackingData {
  if (typeof window === "undefined") {
    return captureTrackingData();
  }

  const stored = sessionStorage.getItem(TRACKING_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as TrackingData;
    } catch {
      // Corrupted data, recapture
    }
  }

  return captureTrackingData();
}

/**
 * Clears persisted tracking data (e.g., after successful registration).
 */
export function clearTrackingData(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TRACKING_STORAGE_KEY);
}
