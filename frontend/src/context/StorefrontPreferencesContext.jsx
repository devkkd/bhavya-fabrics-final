"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

const CURRENCY_STORAGE_KEY = "bhavya-store-currency";
const LANGUAGE_STORAGE_KEY = "bhavya-store-language";
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/INR";

const CURRENCIES = [
  ["INR", "🇮🇳"],
  ["USD", "🇺🇸"],
  ["EUR", "🇪🇺"],
  ["GBP", "🇬🇧"],
  ["AED", "🇦🇪"],
  ["AUD", "🇦🇺"],
  ["CAD", "🇨🇦"],
  ["SGD", "🇸🇬"],
  ["NZD", "🇳🇿"],
  ["SAR", "🇸🇦"],
  ["QAR", "🇶🇦"],
  ["KWD", "🇰🇼"],
  ["OMR", "🇴🇲"],
  ["BHD", "🇧🇭"],
  ["JPY", "🇯🇵"],
  ["CNY", "🇨🇳"],
  ["HKD", "🇭🇰"],
  ["TWD", "🇹🇼"],
  ["KRW", "🇰🇷"],
  ["THB", "🇹🇭"],
  ["MYR", "🇲🇾"],
  ["IDR", "🇮🇩"],
  ["PHP", "🇵🇭"],
  ["VND", "🇻🇳"],
  ["BDT", "🇧🇩"],
  ["PKR", "🇵🇰"],
  ["LKR", "🇱🇰"],
  ["NPR", "🇳🇵"],
  ["ZAR", "🇿🇦"],
  ["NGN", "🇳🇬"],
  ["KES", "🇰🇪"],
  ["EGP", "🇪🇬"],
  ["TRY", "🇹🇷"],
  ["CHF", "🇨🇭"],
  ["SEK", "🇸🇪"],
  ["NOK", "🇳🇴"],
  ["DKK", "🇩🇰"],
  ["PLN", "🇵🇱"],
  ["CZK", "🇨🇿"],
  ["HUF", "🇭🇺"],
  ["RON", "🇷🇴"],
  ["BRL", "🇧🇷"],
  ["MXN", "🇲🇽"],
  ["ARS", "🇦🇷"],
  ["CLP", "🇨🇱"],
];

const LANGUAGES = [
  ["en", "English"], ["hi", "Hindi"], ["ar", "Arabic"], ["bn", "Bengali"],
  ["zh-CN", "Chinese (Simplified)"], ["zh-TW", "Chinese (Traditional)"],
  ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"],
  ["ja", "Japanese"], ["ko", "Korean"], ["pt", "Portuguese"], ["ru", "Russian"],
  ["ur", "Urdu"], ["pa", "Punjabi"], ["ta", "Tamil"], ["te", "Telugu"],
  ["mr", "Marathi"], ["gu", "Gujarati"], ["kn", "Kannada"], ["ml", "Malayalam"],
  ["ne", "Nepali"], ["id", "Indonesian"], ["th", "Thai"], ["tr", "Turkish"],
  ["nl", "Dutch"], ["pl", "Polish"], ["he", "Hebrew"], ["el", "Greek"],
  ["vi", "Vietnamese"], ["sw", "Swahili"], ["fa", "Persian"], ["uk", "Ukrainian"],
  ["si", "Sinhala"], ["my", "Burmese"], ["km", "Khmer"], ["lo", "Lao"],
  ["fil", "Filipino"], ["da", "Danish"], ["sv", "Swedish"], ["no", "Norwegian"],
  ["fi", "Finnish"], ["cs", "Czech"], ["hu", "Hungarian"], ["ro", "Romanian"],
  ["sk", "Slovak"], ["bg", "Bulgarian"], ["hr", "Croatian"], ["sr", "Serbian"],
  ["ca", "Catalan"], ["et", "Estonian"], ["lv", "Latvian"], ["lt", "Lithuanian"],
  ["sq", "Albanian"], ["am", "Amharic"], ["hy", "Armenian"], ["az", "Azerbaijani"],
  ["eu", "Basque"], ["bs", "Bosnian"], ["ceb", "Cebuano"], ["eo", "Esperanto"],
  ["ka", "Georgian"], ["ht", "Haitian Creole"], ["is", "Icelandic"], ["ga", "Irish"],
  ["kk", "Kazakh"], ["ku", "Kurdish"], ["ky", "Kyrgyz"], ["mg", "Malagasy"],
  ["mn", "Mongolian"], ["ps", "Pashto"], ["sm", "Samoan"], ["tg", "Tajik"],
  ["uz", "Uzbek"], ["yi", "Yiddish"], ["yo", "Yoruba"], ["zu", "Zulu"],
  ["af", "Afrikaans"], ["be", "Belarusian"], ["la", "Latin"], ["mk", "Macedonian"],
  ["mt", "Maltese"], ["ha", "Hausa"], ["ig", "Igbo"], ["jw", "Javanese"],
  ["ny", "Chichewa"], ["so", "Somali"], ["gd", "Scottish Gaelic"], ["st", "Sesotho"],
];

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
const CURRENCY_FLAGS = Object.fromEntries(CURRENCIES);
const CURRENCY_CODES =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : CURRENCIES.map(([code]) => code);
const CURRENCY_OPTIONS = CURRENCY_CODES.map((code) => ({
  code,
  flag: CURRENCY_FLAGS[code] || "🌐",
  name: currencyNames.of(code) || code,
}));

const StorefrontPreferencesContext = createContext(null);
const currencyListeners = new Set();
const languageListeners = new Set();

function getSavedValue(key, allowedValues, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    const isAllowed =
      typeof allowedValues === "function"
        ? allowedValues(value)
        : allowedValues.includes(value);
    return isAllowed ? value : fallback;
  } catch (error) {
    console.error(`Unable to read storefront preference "${key}":`, error);
    return fallback;
  }
}

function saveValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Unable to save storefront preference "${key}":`, error);
  }
}

function subscribeToPreference(listeners, listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyPreferenceListeners(listeners) {
  listeners.forEach((listener) => listener());
}

function subscribeToCurrency(listener) {
  return subscribeToPreference(currencyListeners, listener);
}

function subscribeToLanguage(listener) {
  return subscribeToPreference(languageListeners, listener);
}

function getCurrencySnapshot() {
  return getSavedValue(
    CURRENCY_STORAGE_KEY,
    CURRENCY_OPTIONS.map(({ code }) => code),
    "INR"
  );
}

function getLanguageSnapshot() {
  return getSavedValue(
    LANGUAGE_STORAGE_KEY,
    (value) => typeof value === "string" && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value),
    "en"
  );
}

export function StorefrontPreferencesProvider({ children }) {
  const pathname = usePathname();
  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrencySnapshot,
    () => "INR"
  );
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    () => "en"
  );
  const [rates, setRates] = useState({ INR: 1 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");
  const [translationError, setTranslationError] = useState("");
  const [translatorReady, setTranslatorReady] = useState(false);
  const [languages, setLanguages] = useState(() =>
    LANGUAGES.map(([code, name]) => ({ code, name }))
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      try {
        const response = await fetch(EXCHANGE_RATE_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Exchange-rate service returned ${response.status}.`);
        }

        const data = await response.json();
        if (data?.result !== "success" || !data?.rates || typeof data.rates !== "object") {
          throw new Error("Exchange-rate service returned invalid rate data.");
        }

        const validRates = Object.fromEntries(
          Object.entries(data.rates).filter(
            ([code, rate]) =>
              CURRENCY_OPTIONS.some((item) => item.code === code) &&
              Number.isFinite(rate) &&
              rate > 0
          )
        );
        setRates({ ...validRates, INR: 1 });
        setRatesError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load currency conversion rates:", error);
          setRatesError("Live currency rates are unavailable. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setRatesLoading(false);
      }
    }

    loadRates();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (ratesLoading || Number.isFinite(rates[currency])) return;
    saveValue(CURRENCY_STORAGE_KEY, "INR");
    notifyPreferenceListeners(currencyListeners);
  }, [currency, rates, ratesLoading]);

  useEffect(() => {
    let mounted = true;
    let languageObserver = null;
    const initializeTranslator = () => {
      if (!mounted) return;
      if (!window.google?.translate?.TranslateElement) {
        setTranslationError("The translation service could not be initialized.");
        return;
      }

      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );

      const readLanguages = () => {
        const selector = document.querySelector(".goog-te-combo");
        if (!(selector instanceof HTMLSelectElement) || selector.options.length < 2) {
          return false;
        }

        const translatedLanguages = Array.from(selector.options)
          .filter((option) => option.value)
          .map((option) => ({
              code: option.value,
              name: option.textContent?.trim() || option.value,
            }));
        setLanguages([
          { code: "en", name: "English" },
          ...translatedLanguages.filter((option) => option.code !== "en"),
        ]);
        setTranslatorReady(true);
        setTranslationError("");
        languageObserver?.disconnect();
        return true;
      };

      if (!readLanguages()) {
        languageObserver = new MutationObserver(readLanguages);
        languageObserver.observe(
          document.getElementById("google_translate_element"),
          { childList: true, subtree: true }
        );
      }
    };
    window.googleTranslateElementInit = initializeTranslator;

    const existingScript = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]'
    );
    if (existingScript) {
      if (window.google?.translate?.TranslateElement) {
        window.googleTranslateElementInit();
      }
      return () => {
        mounted = false;
        languageObserver?.disconnect();
        if (window.googleTranslateElementInit === initializeTranslator) {
          delete window.googleTranslateElementInit;
        }
      };
    }

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      setTranslationError("The translation service could not be loaded.");
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
      languageObserver?.disconnect();
      script.onerror = null;
      if (window.googleTranslateElementInit === initializeTranslator) {
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (!translatorReady || language === "en") return;
    const selector = document.querySelector(".goog-te-combo");
    if (!(selector instanceof HTMLSelectElement)) return;
    selector.value = language;
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  }, [language, pathname, translatorReady]);

  const changeCurrency = useCallback((value) => {
    if (!CURRENCY_OPTIONS.some((item) => item.code === value)) return;
    saveValue(CURRENCY_STORAGE_KEY, value);
    notifyPreferenceListeners(currencyListeners);
    window.location.reload();
  }, []);

  const changeLanguage = useCallback((value) => {
    if (!languages.some((item) => item.code === value)) return;
    saveValue(LANGUAGE_STORAGE_KEY, value);
    notifyPreferenceListeners(languageListeners);
    document.cookie = `googtrans=/en/${value}; path=/`;
    window.location.reload();
  }, [languages]);

  const formatPrice = useCallback(
    (amount) => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount)) return "";
      const rate = rates[currency];
      if (!Number.isFinite(rate)) return "";

      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(numericAmount * rate);
    },
    [currency, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      language,
      currencies: CURRENCY_OPTIONS.filter(({ code }) => Number.isFinite(rates[code])),
      languages,
      ratesLoading,
      ratesError,
      translationError,
      formatPrice,
      changeCurrency,
      changeLanguage,
    }),
    [
      currency,
      language,
      languages,
      rates,
      ratesLoading,
      ratesError,
      translationError,
      formatPrice,
      changeCurrency,
      changeLanguage,
    ]
  );

  return (
    <StorefrontPreferencesContext.Provider value={value}>
      {children}
      <div id="google_translate_element" aria-hidden="true" />
      <style>{`
        #google_translate_element {
          position: fixed;
          top: -1000px;
          left: -1000px;
          width: 300px;
          height: 50px;
          opacity: 0;
          pointer-events: none;
        }
        .goog-te-banner-frame,
        iframe[class*="VIpgJd"][class*="ORHb"] {
          display: none !important;
          visibility: hidden !important;
        }
        body { top: 0 !important; }
      `}</style>
    </StorefrontPreferencesContext.Provider>
  );
}

export function StorefrontPrice({ amount }) {
  const { formatPrice } = useStorefrontPreferences();
  return formatPrice(amount);
}

export function useStorefrontPreferences() {
  const context = useContext(StorefrontPreferencesContext);
  if (!context) {
    throw new Error(
      "useStorefrontPreferences must be used within StorefrontPreferencesProvider."
    );
  }
  return context;
}
