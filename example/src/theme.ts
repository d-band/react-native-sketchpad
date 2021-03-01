import { useColorScheme } from 'react-native';

export function useTheme() {
  const colors = {
    primary: '#0d6efd',
    bg: '#fff',
    light: '#f1f1f1',
    text: '#43484d',
    border: '#eee',
  };
  const colorsDark = {
    primary: '#58a6ff',
    bg: '#000',
    light: '#f1f1f1',
    text: '#f1f1f1',
    border: '#30363d',
  };
  const theme = useColorScheme();
  if (theme === 'dark') {
    return colorsDark;
  }
  return colors;
}
