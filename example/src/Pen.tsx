import * as React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Pen({
  color,
  size,
  borderColor,
}: {
  color: string;
  size: number;
  borderColor?: string;
}) {
  const penStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };
  return (
    <View style={[styles.wrap, { borderColor: borderColor || color }]}>
      <View style={penStyle} />
    </View>
  );
}
