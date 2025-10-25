import 'react-native-gesture-handler/jestSetup';

// Mock do Expo
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({ recording: { stopAndUnloadAsync: jest.fn() } })),
    },
  },
}));

// Mock do React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
