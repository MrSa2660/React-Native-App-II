import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Text,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPE_COLORS } from '@/constants/pokemon-types';
import { spriteUrl, type PokemonStub } from '@/api/pokemon';
import { usePokedex } from '@/hooks/use-pokedex';

function pad(n: number) {
  return `#${String(n).padStart(3, '0')}`;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PokedexScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const numCols = width > height ? 3 : 2;
  const [search, setSearch] = useState('');

  const { pokemon, loading, error } = usePokedex(151);

  const filtered = search.trim()
    ? pokemon.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
          pad(p.id).includes(search.trim())
      )
    : pokemon;

  const renderItem = useCallback(
    ({ item }: { item: PokemonStub }) => {
      const bgColor = TYPE_COLORS[item.types[0]] ?? '#A8A878';
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: bgColor }]}
          onPress={() => router.push(`/pokemon/${item.id}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.cardNum}>{pad(item.id)}</Text>
          <Image
            source={{ uri: spriteUrl(item.id) }}
            style={styles.sprite}
            resizeMode="contain"
          />
          <Text style={styles.cardName}>{cap(item.name)}</Text>
          <View style={styles.typeRow}>
            {item.types.map((t) => (
              <View key={t} style={styles.badge}>
                <Text style={styles.badgeText}>{cap(t)}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#EE1515" />
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
        <TextInput
          style={styles.search}
          placeholder="Search name or #..."
          placeholderTextColor="rgba(255,255,255,0.65)"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#EE1515" />
          <Text style={styles.loadingText}>Loading Pokédex…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          key={String(numCols)}
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(p) => String(p.id)}
          numColumns={numCols}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No Pokémon found for &quot;{search}&quot;</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#EE1515',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  search: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fff',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 15 },
  errorText: { color: '#c0392b', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  list: { padding: 8, paddingBottom: 32 },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.18)',
  },
  cardNum: {
    alignSelf: 'flex-end',
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.28)',
  },
  sprite: { width: 90, height: 90, marginVertical: 4 },
  cardName: { fontSize: 13, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 4, marginTop: 5 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
