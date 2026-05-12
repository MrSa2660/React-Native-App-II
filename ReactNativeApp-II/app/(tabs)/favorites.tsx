import React, { useState, useCallback } from 'react';
import {
  FlatList, StyleSheet, View, Text, TouchableOpacity,
  Image, StatusBar, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEN1_POKEMON, spriteUrl, type PokemonStub } from '@/constants/gen1-pokemon';
import { TYPE_COLORS } from '@/constants/pokemon-types';

const STORAGE_KEY = '@pokedex_favorites';

function pad(n: number) { return `#${String(n).padStart(3, '0')}`; }
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function FavoritesScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const numCols = width > height ? 3 : 2;

  const [favIds, setFavIds] = useState<Set<number>>(new Set());

  // Re-read favorites every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then((val) => {
        try {
          setFavIds(new Set(val ? (JSON.parse(val) as number[]) : []));
        } catch {
          setFavIds(new Set());
        }
      });
    }, []),
  );

  const favorites: PokemonStub[] = GEN1_POKEMON.filter((p) => favIds.has(p.id));

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
          <Image source={{ uri: spriteUrl(item.id) }} style={styles.sprite} resizeMode="contain" />
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
    [router],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#EE1515" />
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} saved</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyMsg}>Open a Pokémon and tap the heart to save it here.</Text>
        </View>
      ) : (
        <FlatList
          key={String(numCols)}
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(p) => String(p.id)}
          numColumns={numCols}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#EE1515',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  emptyMsg: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  list: { padding: 8, paddingBottom: 32 },
  card: {
    flex: 1, margin: 6, borderRadius: 16, padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 3,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.18)',
  },
  cardNum: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.28)' },
  sprite: { width: 90, height: 90, marginVertical: 4 },
  cardName: { fontSize: 13, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 4, marginTop: 5 },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
});
