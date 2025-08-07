// hooks/useImmersiveMode.ts
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from 'expo-router';
import { Platform } from 'react-native';

// Bu hook, çağrıldığı ekran odaklandığında tam ekran modunu zorla uygular.
export function useImmersiveMode() {
  useFocusEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    
    // Sadece navigation bar'ı gizle - setBehaviorAsync edge-to-edge ile uyumsuz
    NavigationBar.setVisibilityAsync('hidden');
  });
}
