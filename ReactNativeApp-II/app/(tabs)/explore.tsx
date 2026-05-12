import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ALL_TYPES, TYPE_COLORS } from '@/constants/pokemon-types';

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TypesScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: TYPE_COLORS[item] }]}
      onPress={() => router.push(`/type/${item}`)}
      activeOpacity={0.8}
    >
      <Text style={styles.typeName}>{cap(item)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#EE1515" />
      <View style={styles.header}>
        <Text style={styles.title}>Types</Text>
        <Text style={styles.subtitle}>Browse Gen 1 Pokémon by type</Text>
      </View>
      <FlatList
        data={[...ALL_TYPES]}
        renderItem={renderItem}
        keyExtractor={(t) => t}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  list: { padding: 8, paddingBottom: 32 },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    boxShadow: '0px 2px 3px rgba(0,0,0,0.15)',
  },
  typeName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
});
