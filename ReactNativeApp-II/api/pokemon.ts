const BASE = 'https://pokeapi.co/api/v2';

export interface StatEntry { name: string; value: number }

export interface PokemonStub {
  id: number;
  name: string;
  types: string[];
  stats: StatEntry[];
  height: number;
  weight: number;
  abilities: string[];
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

function mapRaw(raw: RawPokemon): PokemonStub {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    types: raw.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: raw.abilities.map((a) => a.ability.name),
  };
}

// Session-level cache so screens don't re-fetch on every mount
let listCache: PokemonStub[] | null = null;
const detailCache = new Map<number, PokemonStub>();

export async function fetchPokemon(idOrName: number | string): Promise<PokemonStub> {
  const id = typeof idOrName === 'number' ? idOrName : undefined;
  if (id && detailCache.has(id)) return detailCache.get(id)!;

  const res = await fetch(`${BASE}/pokemon/${idOrName}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${idOrName}`);
  const stub = mapRaw(await res.json() as RawPokemon);
  detailCache.set(stub.id, stub);
  return stub;
}

export async function fetchPokemonList(limit = 151): Promise<PokemonStub[]> {
  if (listCache && listCache.length >= limit) return listCache.slice(0, limit);

  const res = await fetch(`${BASE}/pokemon?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch Pokémon list');
  const data: { results: { name: string }[] } = await res.json();
  const list = await Promise.all(data.results.map((item) => fetchPokemon(item.name)));
  listCache = list;
  return list;
}
