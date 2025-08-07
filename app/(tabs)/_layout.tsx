// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import { BookOpen, House } from 'phosphor-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';



export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            display: 'none', // Tab bar'ı gizle
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: () => null,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            tabBarIcon: () => null,
          }}
        />
      </Tabs>
      
      {/* Özel Tab Bar */}
      <View style={{
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
      }}>
        <CustomTabBar focused={false} />
      </View>
    </>
  );
}

const CustomTabBar = ({ focused }: { focused: boolean }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const router = useRouter();



  const tabs = [
    { icon: House, name: 'home' },
    { icon: BookOpen, name: 'journal' },
  ];

  const handleTabPress = (tabName: string, index: number) => {
    setActiveTab(index);
    if (tabName === 'home') {
      router.push('/(tabs)');
    } else if (tabName === 'journal') {
      router.push('/(tabs)/journal');
    }
    // Chat ve Profile için şimdilik sadece state değişiyor
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      height: '100%',
    }}>
      {/* Sol taraftaki Ana Sayfa ikonu */}
      <TouchableOpacity
        onPress={() => handleTabPress('home', 0)}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: activeTab === 0 ? colors.primaryButton : 'transparent',
        }}
      >
        <House
          size={28}
          color={activeTab === 0 ? colors.textLight : colors.textMuted}
          weight={activeTab === 0 ? 'fill' : 'regular'}
        />
      </TouchableOpacity>

      {/* Sağ taraftaki Günlük ikonu */}
      <TouchableOpacity
        onPress={() => handleTabPress('journal', 1)}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: activeTab === 1 ? colors.primaryButton : 'transparent',
        }}
      >
        <BookOpen
          size={28}
          color={activeTab === 1 ? colors.textLight : colors.textMuted}
          weight={activeTab === 1 ? 'fill' : 'regular'}
        />
      </TouchableOpacity>
    </View>
  );
};
