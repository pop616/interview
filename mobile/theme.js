import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    placeholder: '#757575',
    disabled: '#bdbdbd',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};


export const API_URL = 'http://192.168.0.182:3001/api';

