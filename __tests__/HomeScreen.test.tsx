import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Pressable, Text, TextInput} from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';

const names = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .filter(node => node.props.style?.fontWeight === '700' && node.props.style?.fontSize === 17)
    .map(node => node.props.children);

it('re-ranks on keywords and hides dismissed projects', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<HomeScreen />);
  });
  expect(names(tree)).toHaveLength(5);

  await ReactTestRenderer.act(() => {
    tree.root.findByType(TextInput).props.onChangeText('regex');
  });
  expect(names(tree)[0]).toBe('Regex Tester');

  const notForMe = tree.root
    .findAllByType(Pressable)
    .find(p => JSON.stringify(p.findByType(Text).props.children) === '"Not for me"');
  await ReactTestRenderer.act(() => {
    notForMe!.props.onPress();
  });
  expect(names(tree)).not.toContain('Regex Tester');
});
