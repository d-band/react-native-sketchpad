import React, { useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CameraRoll from '@d-band/cameraroll';
import Sketchpad, {
  HardBrush,
  SketchpadRef,
  SoftBrush,
} from 'react-native-sketchpad';
import Pen from './Pen';
import PenPicker from './PenPicker';
import { useTheme } from './theme';

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        statusBar: {
          flex: 0,
          backgroundColor: theme.bg,
        },
        container: {
          flex: 1,
          flexDirection: 'column',
          backgroundColor: theme.light,
        },
        btns: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        btn: {
          flex: 1,
          fontSize: 16,
          alignItems: 'center',
          padding: 10,
        },
        pad: {
          flex: 1,
          backgroundColor: '#fff',
          margin: 10,
        },
      }),
    [theme]
  );
  return { theme, styles };
};

export default function App() {
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [brushType, setBrushType] = useState('soft');
  const [visible, setVisible] = useState(false);
  const pad = useRef<SketchpadRef>(null);
  const { theme, styles } = useStyles();

  const onClear = () => {
    pad.current?.clear();
  };
  const onUndo = () => {
    pad.current?.undo();
  };
  const hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };
  const saveImage = async (base64: string) => {
    if (Platform.OS === 'android') {
      const ok = await hasAndroidPermission();
      if (!ok) return;
    }
    await CameraRoll.save(`data:image/png;base64,${base64}`);
  };
  const onSave = () => {
    pad.current?.toDataURL(saveImage);
  };
  const onPen = () => {
    setVisible(!visible);
  };
  const onPenType = () => {
    setBrushType(brushType === 'soft' ? 'hard' : 'soft');
  };
  const brush = useMemo(() => {
    if (brushType === 'soft') {
      return new SoftBrush(color, size / 2, size * 1.5);
    }
    return new HardBrush(color, size);
  }, [color, size, brushType]);
  const colors = [
    '#000000',
    '#FF0000',
    '#00FFFF',
    '#0000FF',
    '#0000A0',
    '#ADD8E6',
    '#800080',
    '#FFFF00',
    '#00FF00',
    '#FF00FF',
    '#C0C0C0',
    '#808080',
    '#FFA500',
    '#A52A2A',
    '#800000',
    '#008000',
    '#808000',
  ];

  return (
    <>
      <SafeAreaView style={styles.statusBar} />
      <SafeAreaView style={styles.container}>
        <Sketchpad ref={pad} style={styles.pad} brush={brush} />
        <View style={styles.btns}>
          <TouchableOpacity style={styles.btn} onPress={onPen}>
            <Pen color={color} size={size} borderColor={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onPenType}>
            {brushType === 'soft' ? (
              <Icon name="brush-outline" size={32} color={theme.text} />
            ) : (
              <Icon name="pencil-outline" size={32} color={theme.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onUndo}>
            <Icon name="arrow-undo-outline" size={32} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onClear}>
            <Icon name="trash-outline" size={32} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onSave}>
            <Icon name="save-outline" size={32} color={theme.text} />
          </TouchableOpacity>
        </View>
        <PenPicker
          visible={visible}
          color={color}
          size={size}
          colors={colors}
          onSizeChange={(s) => setSize(s)}
          onColorChange={(c) => setColor(c)}
          onClose={() => setVisible(false)}
        />
      </SafeAreaView>
      <SafeAreaView style={styles.statusBar} />
    </>
  );
}
