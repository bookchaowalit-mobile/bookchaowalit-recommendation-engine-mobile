import React from 'react';
import {Linking, Pressable, SectionList, StyleSheet, Text} from 'react-native';
import {PROJECT_CATEGORIES} from '../lib/catalog';
import {CATEGORY_WEIGHTS, INTENTS} from '../lib/rank';

/** The whole catalog with each category's editorial weights, so ranking is auditable. */
export default function ExploreScreen() {
  const sections = PROJECT_CATEGORIES.map(category => ({
    title: category.label,
    weights: INTENTS.map(
      intent => `${intent.label} ${CATEGORY_WEIGHTS[category.id]?.[intent.id] ?? 0}`,
    ).join(' · '),
    data: category.projects,
  }));

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={item => item.slug}
      renderSectionHeader={({section}) => (
        <Text style={styles.header} accessibilityRole="header">
          {section.title}
          <Text style={styles.weights}>  {section.weights}</Text>
        </Text>
      )}
      renderItem={({item}) => (
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(item.url)}
          style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f7f9'},
  header: {
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: '#e4e7ec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#222',
  },
  weights: {fontSize: 12, fontWeight: '400', color: '#666'},
  row: {paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff'},
  name: {fontSize: 15, color: '#111'},
});
