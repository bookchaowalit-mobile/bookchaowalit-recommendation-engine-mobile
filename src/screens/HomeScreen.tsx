import React, {useMemo, useState} from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {projectHost} from '../lib/catalog';
import {INTENTS, rank, type Intent} from '../lib/rank';

/** Ranking desk: pick an intent, add keywords, see every score explained. */
export default function HomeScreen() {
  const [intent, setIntent] = useState<Intent>('make');
  const [query, setQuery] = useState('');
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());

  const results = useMemo(
    () => rank(intent, {query, exclude: dismissed}),
    [intent, query, dismissed],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.segment} accessibilityRole="tablist">
        {INTENTS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => setIntent(item.id)}
            accessibilityRole="tab"
            accessibilityState={{selected: intent === item.id}}
            accessibilityHint={item.brief}
            style={[styles.segmentItem, intent === item.id && styles.segmentActive]}>
            <Text
              style={[
                styles.segmentText,
                intent === item.id && styles.segmentTextActive,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.brief}>
        {INTENTS.find(item => item.id === intent)?.brief}
      </Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Keywords, e.g. url json tracker"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Keywords"
      />

      {results.length === 0 ? (
        <Text style={styles.empty}>
          No project scores above zero for this intent and these keywords.
        </Text>
      ) : (
        results.map((rec, index) => (
          <View key={rec.project.slug} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.cardTitle}>
                <Text style={styles.name}>{rec.project.name}</Text>
                <Text style={styles.meta}>
                  {rec.category} · {projectHost(rec.project.url)}
                </Text>
              </View>
              <Text style={styles.score} accessibilityLabel={`Score ${rec.score}`}>
                {rec.score}
              </Text>
            </View>
            {rec.reasons.map(reason => (
              <Text key={reason} style={styles.reason}>
                • {reason}
              </Text>
            ))}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL(rec.project.url)}
                style={styles.action}>
                <Text style={styles.actionPrimary}>Open</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setDismissed(prev => new Set(prev).add(rec.project.slug))
                }
                style={styles.action}>
                <Text style={styles.actionText}>Not for me</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      {dismissed.size > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setDismissed(new Set())}
          style={styles.reset}>
          <Text style={styles.actionText}>
            Restore {dismissed.size} dismissed
          </Text>
        </Pressable>
      )}
      <Text style={styles.footnote}>
        Rule-based: hand-set category weights plus +4 per matching keyword. No
        model, no tracking.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f7f9'},
  content: {padding: 16, paddingBottom: 48},
  segment: {flexDirection: 'row', backgroundColor: '#e4e7ec', borderRadius: 10, padding: 3},
  segmentItem: {flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8},
  segmentActive: {backgroundColor: '#fff'},
  segmentText: {color: '#555', fontWeight: '600'},
  segmentTextActive: {color: '#3a0ca3'},
  brief: {color: '#666', marginTop: 8, marginBottom: 8},
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dde',
    padding: 12,
    fontSize: 15,
    color: '#111',
    marginBottom: 12,
  },
  empty: {color: '#777', textAlign: 'center', marginTop: 24},
  card: {backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10},
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  rank: {fontSize: 16, color: '#999', width: 34, fontWeight: '700'},
  cardTitle: {flex: 1},
  name: {fontSize: 17, fontWeight: '700', color: '#111'},
  meta: {fontSize: 12, color: '#777'},
  score: {fontSize: 22, fontWeight: '800', color: '#3a0ca3'},
  reason: {fontSize: 13, color: '#444', marginTop: 4},
  actions: {flexDirection: 'row', gap: 16, marginTop: 10},
  action: {paddingVertical: 6},
  actionPrimary: {color: '#3a0ca3', fontWeight: '700'},
  actionText: {color: '#555', fontWeight: '600'},
  reset: {alignItems: 'center', padding: 10},
  footnote: {fontSize: 12, color: '#888', marginTop: 12, textAlign: 'center'},
});
