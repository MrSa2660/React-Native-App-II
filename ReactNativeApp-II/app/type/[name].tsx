import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TYPE_COLORS } from '@/constants/pokemon-types';
import { GEN1_POKEMON, spriteUrl } from '@/constants/gen1-pokemon';

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pad(n: number) {
  return `#${String(n).padStart(3, '0')}`;
}

export default function TypeScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();

  const headerColor = TYPE_COLORS[name ?? ''] ?? '#A8A878';

  const pokemon = useMemo(
    () => GEN1_POKEMON.filter((p) => p.types.includes(name ?? '')),
    [name]
  );

  const renderItem = ({ item }: { item: (typeof GEN1_POKEMON)[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: headerColor }]}
      onPress={() => router.push(`/pokemon/${item.id}`)}
      activeOpacity={0.8}
    >
      <Text style={styles.num}>{pad(item.id)}</Text>
      <Image source={{ uri: spriteUrl(item.id) }} style={styles.sprite} resizeMode="contain" />
      <Text style={styles.pokeName}>{cap(item.name)}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.root, { backgroundColor: headerColor }]} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{cap(name ?? '')} Type</Text>
          <Text style={styles.count}>{pokemon.length} Pokémon</Text>
        </View>

        <FlatList
          data={pokemon}
          renderItem={renderItem}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No Gen 1 Pokémon of this type.</Text>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backArrow: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#fff' },
  count: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  list: { padding: 8, paddingBottom: 32, backgroundColor: '#f2f2f2' },
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
  num: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.28)' },
  sprite: { width: 90, height: 90, marginVertical: 4 },
  pokeName: { fontSize: 13, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
