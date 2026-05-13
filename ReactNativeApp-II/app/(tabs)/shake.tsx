import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, StatusBar, useWindowDimensions, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withSpring, withRepeat, withTiming,
} from 'react-native-reanimated';
import { Accelerometer } from 'expo-sensors';
import { useFocusEffect } from 'expo-router';
import { spriteUrl, type PokemonStub } from '@/api/pokemon';
import { TYPE_COLORS } from '@/constants/pokemon-types';
import { usePokedex } from '@/hooks/use-pokedex';

const SHAKE_THRESHOLD = 2.5;
const COOLDOWN_MS = 1800;

const STAT_LABELS: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SpA', 'special-defense': 'SpD', speed: 'SPD',
};

function cap(s: string) {
  return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function pad(n: number) { return `#${String(n).padStart(3, '0')}`; }

function Pokeball({ size }: { size: number }) {
  const r = size / 2;
  const border = Math.max(2, size * 0.025);
  const stripH = Math.max(3, size * 0.03);
  const btnSize = size * 0.28;
  const btnR = btnSize / 2;
  return (
    <View style={{
      width: size, height: size, borderRadius: r,
      overflow: 'hidden', borderWidth: border, borderColor: '#1a1a1a',
    }}>
      <View style={{ height: r, backgroundColor: '#EE1515' }} />
      <View style={{ height: r, backgroundColor: '#fff' }} />
      <View style={{
        position: 'absolute', top: r - stripH / 2 - border / 2,
        left: 0, right: 0, height: stripH, backgroundColor: '#1a1a1a',
      }} />
      <View style={{
        position: 'absolute',
        top: r - btnR - border / 2, left: r - btnR,
        width: btnSize, height: btnSize, borderRadius: btnR,
        backgroundColor: '#f0f0f0', borderWidth: border, borderColor: '#1a1a1a',
      }} />
    </View>
  );
}

export default function ShakeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const ballSize = Math.min(width * 0.4, 160);

  const { pokemon: allPokemon } = usePokedex(151);
  const allPokemonRef = useRef(allPokemon);
  useEffect(() => { allPokemonRef.current = allPokemon; }, [allPokemon]);

  const [pokemon, setPokemon] = useState<PokemonStub | null>(null);
  const lastShakeRef = useRef(0);

  const shakeX = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);

  // Idle Pokéball bounce
  useEffect(() => {
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 700 }),
        withTiming(0, { duration: 700 }),
      ), -1, false,
    );
  }, []);

  const reveal = useCallback((p: PokemonStub) => {
    setPokemon(p);
    cardOpacity.value = withTiming(1, { duration: 300 });
    cardScale.value = withSpring(1, { mass: 0.8, stiffness: 180 });
  }, []);

  const handleShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeRef.current < COOLDOWN_MS) return;
    lastShakeRef.current = now;

    if (allPokemonRef.current.length === 0) return;
    const picked = allPokemonRef.current[Math.floor(Math.random() * allPokemonRef.current.length)];

    // Reset card
    cardOpacity.value = 0;
    cardScale.value = 0.8;
    setPokemon(null);

    // Shake Pokéball left-right
    shakeX.value = withSequence(
      withSpring(-28, { mass: 0.3, stiffness: 700, damping: 8 }),
      withSpring(28,  { mass: 0.3, stiffness: 700, damping: 8 }),
      withSpring(-20, { mass: 0.3, stiffness: 700, damping: 8 }),
      withSpring(20,  { mass: 0.3, stiffness: 700, damping: 8 }),
      withSpring(-10, { mass: 0.3, stiffness: 700, damping: 8 }),
      withSpring(0,   { mass: 0.3, stiffness: 700, damping: 14 }),
    );

    // Reveal Pokémon after animation (~750 ms)
    setTimeout(() => reveal(picked), 750);
  }, [reveal]);

  // Accelerometer — active only while tab is focused, native only
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;
      Accelerometer.setUpdateInterval(80);
      const sub = Accelerometer.addListener(({ x, y, z }) => {
        if (Math.sqrt(x * x + y * y + z * z) > SHAKE_THRESHOLD) handleShake();
      });
      return () => sub.remove();
    }, [handleShake]),
  );

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { translateY: bounceY.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const bgColor = pokemon ? (TYPE_COLORS[pokemon.types[0]] ?? '#A8A878') : '#f2f2f2';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bgColor }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Random</Text>
        <Text style={styles.subtitle}>Shake your phone!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={ballStyle}>
          <Pokeball size={ballSize} />
        </Animated.View>

        {!pokemon && (
          <Text style={styles.hint}>
            {Platform.OS === 'web'
              ? 'Tap the button to discover a random Pokémon'
              : 'Shake your phone or tap the button\nto discover a random Pokémon'}
          </Text>
        )}

        {pokemon && (
          <Animated.View style={[styles.card, { backgroundColor: TYPE_COLORS[pokemon.types[0]] ?? '#A8A878' }, cardStyle]}>
            <Text style={styles.cardNum}>{pad(pokemon.id)}</Text>
            <Image source={{ uri: spriteUrl(pokemon.id) }} style={styles.sprite} resizeMode="contain" />
            <Text style={styles.pokeName}>{cap(pokemon.name)}</Text>
            <View style={styles.typeRow}>
              {pokemon.types.map((t) => (
                <View key={t} style={styles.badge}>
                  <Text style={styles.badgeText}>{cap(t)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.statsWrap}>
              {pokemon.stats.map((s) => (
                <View key={s.name} style={styles.statRow}>
                  <Text style={styles.statLabel}>{STAT_LABELS[s.name] ?? s.name}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.min(Math.round((s.value / 255) * 100), 100)}%` }]} />
                  </View>
                  <Text style={styles.statVal}>{s.value}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => router.push(`/pokemon/${pokemon.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.detailBtnText}>View Full Details</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <TouchableOpacity style={styles.shakeBtn} onPress={handleShake} activeOpacity={0.8}>
          <Text style={styles.shakeBtnText}>{pokemon ? '🎲  Try Again' : '🎲  Pick Random'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 20, paddingBottom: 16 },
  hint: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },
  card: {
    width: '100%', borderRadius: 22, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
    boxShadow: '0px 6px 10px rgba(0,0,0,0.25)',
  },
  cardNum: { alignSelf: 'flex-end', color: 'rgba(0,0,0,0.25)', fontWeight: '700', fontSize: 12 },
  sprite: { width: 120, height: 120 },
  pokeName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 6 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsWrap: { width: '100%', marginTop: 14, gap: 6 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { width: 34, color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700' },
  barBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.85)' },
  statVal: { width: 28, color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'right' },
  detailBtn: {
    marginTop: 14, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 24, paddingVertical: 8,
  },
  detailBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  shakeBtn: {
    backgroundColor: '#EE1515', borderRadius: 28,
    paddingHorizontal: 36, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
    boxShadow: '0px 3px 6px rgba(0,0,0,0.2)',
  },
  shakeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
