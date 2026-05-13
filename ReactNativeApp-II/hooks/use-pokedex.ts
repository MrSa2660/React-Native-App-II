import { useState, useEffect } from 'react';
import { type PokemonStub, fetchPokemonList } from '@/api/pokemon';

interface UsePokedexResult {
  pokemon: PokemonStub[];
  loading: boolean;
  error: string | null;
}

export function usePokedex(limit = 151): UsePokedexResult {
  const [pokemon, setPokemon] = useState<PokemonStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await fetchPokemonList(limit);
        if (!cancelled) setPokemon(list);
      } catch {
        if (!cancelled) setError('Failed to load Pokémon. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { pokemon, loading, error };
}
