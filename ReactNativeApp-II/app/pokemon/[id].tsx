import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPE_COLORS } from '@/constants/pokemon-types';
import { GEN1_POKEMON, spriteUrl } from '@/constants/gen1-pokemon';
import { useFavorites } from '@/hooks/use-favorites';

const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959', attack: '#F5AC78', defense: '#FAE078',
  'special-attack': '#9DB7F5', 'special-defense': '#A7DB8D', speed: '#FA92B2',
};
const STAT_LABELS: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'Sp.A', 'special-defense': 'Sp.D', speed: 'SPD',
};

function cap(s: string) {
  return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function pad(n: number) { return `#${String(n).padStart(3, '0')}`; }

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const numId = parseInt(id ?? '1');

  const stub = GEN1_POKEMON.find((p) => p.id === numId);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!stub) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.center} edges={['top']}>
          <Text style={{ color: '#666' }}>Pokémon not found.</Text>
        </SafeAreaView>
      </>
    );
  }

  const headerColor = TYPE_COLORS[stub.types[0]] ?? '#A8A878';
  const fav = isFavorite(numId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.root, { backgroundColor: headerColor }]} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>{cap(stub.name)}</Text>
          <Text style={styles.headerNum}>{pad(stub.id)}</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(numId)}
            style={styles.heartBtn}
            hitSlop={8}
          >
            <Text style={styles.heartIcon}>{fav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sprite */}
        <View style={styles.spriteWrap}>
          <Image source={{ uri: spriteUrl(stub.id) }} style={styles.sprite} resizeMode="contain" />
        </View>

        <ScrollView style={styles.card} contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          {/* Types */}
          <View style={styles.typeRow}>
            {stub.types.map((t) => (
              <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] }]}>
                <Text style={styles.typeText}>{cap(t)}</Text>
              </View>
            ))}
          </View>

          {/* Height / Weight */}
          <View style={styles.physRow}>
            <View style={styles.physItem}>
              <Text style={styles.physVal}>{(stub.height / 10).toFixed(1)} m</Text>
              <Text style={styles.physLabel}>Height</Text>
            </View>
            <View style={styles.physDivider} />
            <View style={styles.physItem}>
              <Text style={styles.physVal}>{(stub.weight / 10).toFixed(1)} kg</Text>
              <Text style={styles.physLabel}>Weight</Text>
            </View>
          </View>

          {/* Abilities */}
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilityRow}>
            {stub.abilities.map((a) => (
              <View key={a} style={[styles.abilityBadge, { borderColor: headerColor }]}>
                <Text style={[styles.abilityText, { color: headerColor }]}>{cap(a)}</Text>
              </View>
            ))}
          </View>

          {/* Base Stats */}
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {stub.stats.map((stat) => {
            const color = STAT_COLORS[stat.name] ?? '#aaa';
            const pct = `${Math.min(Math.round((stat.value / 255) * 100), 100)}%`;
            return (
              <View key={stat.name} style={styles.statRow}>
                <Text style={[styles.statLabel, { color }]}>
                  {STAT_LABELS[stat.name] ?? stat.name.toUpperCase()}
                </Text>
                <Text style={styles.statVal}>{stat.value}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: pct, backgroundColor: color }]} />
                </View>
              </View>
            );
          })}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: { padding: 4, marginRight: 8 },
  backArrow: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  headerName: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerNum: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginRight: 8 },
  heartBtn: { padding: 4 },
  heartIcon: { fontSize: 22 },
  spriteWrap: { alignItems: 'center', paddingBottom: 8 },
  sprite: { width: 180, height: 180 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardContent: { paddingHorizontal: 24, paddingTop: 24 },
  typeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  typeBadge: { borderRadius: 20, paddingHorizontal: 22, paddingVertical: 6 },
  typeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  physRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f9f9f9', borderRadius: 14, paddingVertical: 14, marginBottom: 16,
  },
  physItem: { flex: 1, alignItems: 'center' },
  physVal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  physLabel: { fontSize: 12, color: '#999', marginTop: 3 },
  physDivider: { width: 1, height: 36, backgroundColor: '#e0e0e0' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#333',
    textAlign: 'center', marginBottom: 10, marginTop: 6,
  },
  abilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8, justifyContent: 'center' },
  abilityBadge: { borderWidth: 2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  abilityText: { fontSize: 13, fontWeight: '600' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  statLabel: { width: 38, fontSize: 11, fontWeight: '700' },
  statVal: { width: 34, fontSize: 13, fontWeight: 'bold', color: '#333', textAlign: 'right', marginRight: 10 },
  barBg: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});
