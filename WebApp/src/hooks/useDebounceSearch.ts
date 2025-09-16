import { useState, useEffect, useCallback } from "react";

interface UseDebounceSearchProps<T> {
  searchFunction: (searchTerm: string) => Promise<T[]>;
  delay?: number;
  minLength?: number;
}

interface UseDebounceSearchReturn<T> {
  searchTerm: string;
  results: T[];
  isSearching: boolean;
  error: string | null;
  setSearchTerm: (term: string) => void;
  clearResults: () => void;
  clearError: () => void;
}

export const useDebounceSearch = <T>({
  searchFunction,
  delay = 300,
  minLength = 2,
}: UseDebounceSearchProps<T>): UseDebounceSearchReturn<T> => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeSearchTerm = useCallback((term: string) => {
    return term.trim().replace(/\s+/g, " ");
  }, []);

  useEffect(() => {
    const normalizedTerm = normalizeSearchTerm(searchTerm);

    if (normalizedTerm.length < minLength) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    setError(null);
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchFunction(normalizedTerm);
        setResults(searchResults);
        setError(null);
      } catch (err) {
        console.error("Error en búsqueda:", err);
        setError(err instanceof Error ? err.message : "Error en la búsqueda");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, searchFunction, delay, minLength, normalizeSearchTerm]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchTerm,
    results,
    isSearching,
    error,
    setSearchTerm,
    clearResults,
    clearError,
  };
};
