import * as React from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Pen from './Pen';
import { useTheme } from './theme';

const useStyles = () => {
  const theme = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
        },
        top: {
          flex: 1,
        },
        bottom: {
          height: 54,
        },
        center: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        cell: {
          marginHorizontal: 2.5,
          paddingVertical: 10,
        },
        slider: {
          height: 40,
          marginHorizontal: 10,
        },
      }),
    [theme]
  );
  return { theme, styles };
};

export default function PenPicker({
  size,
  color,
  visible,
  onSizeChange,
  onColorChange,
  minSize = 2,
  maxSize = 22,
  colors = [],
  onClose = () => {},
}: {
  size: number;
  color: string;
  visible: boolean;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  minSize?: number;
  maxSize?: number;
  colors?: string[];
  onClose?: () => void;
}) {
  const { theme, styles } = useStyles();
  const renderItem = (v: { item: string }) => (
    <TouchableOpacity style={styles.cell} onPress={() => onColorChange(v.item)}>
      <Pen
        color={v.item}
        size={maxSize}
        borderColor={v.item === color ? theme.primary : theme.light}
      />
    </TouchableOpacity>
  );
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.wrap}>
        <TouchableOpacity style={styles.top} onPress={onClose} />
        <View style={styles.center}>
          <FlatList
            data={colors}
            extraData={color}
            keyExtractor={(v) => v}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <Slider
            style={styles.slider}
            value={size}
            minimumValue={minSize}
            maximumValue={maxSize}
            onValueChange={onSizeChange}
          />
        </View>
        <TouchableOpacity style={styles.bottom} onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}
