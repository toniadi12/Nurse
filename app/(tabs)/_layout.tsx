// Bottom tab navigator — 4 tab utama: Home, Schedule, Swap, You.
//
// Pakai custom FloatingTabBar (pill mengambang) — lihat
// src/components/navigation/FloatingTabBar.tsx untuk detail spec.
//
// Expo Router pakai @react-navigation/bottom-tabs di balik layar — jadi
// semua API React Navigation tetap berlaku. Tanda kurung di nama folder
// `(tabs)` artinya "route group" — tidak muncul di URL, cuma untuk grouping.
//
// Jadi:
//   app/(tabs)/home.tsx      → URL "/home"     ← Beranda (initial route)
//   app/(tabs)/schedule.tsx  → URL "/schedule"
//   app/(tabs)/swap.tsx      → URL "/swap"
//   app/(tabs)/profile.tsx   → URL "/profile"
//
// Catatan: "home" bukan "index" supaya tidak konflik path dengan
// app/index.tsx (yang berfungsi sebagai splash + decision route — keduanya
// resolve ke "/" kalau pakai nama "index").

import { Tabs } from 'expo-router';
import { Home, CalendarDays, ArrowLeftRight, User } from 'lucide-react-native';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

// Cara resmi Expo Router untuk set initial tab — prop `initialRouteName`
// pada <Tabs> diam-diam diabaikan, harus lewat unstable_settings export.
// "home" cocok dengan home.tsx (kita rename dari index.tsx supaya tidak
// konflik path dengan app/index.tsx yang jadi splash).
export const unstable_settings = {
  initialRouteName: 'home',
};

// Stroke 1.5 sesuai DESIGN.md section 8 — outline halus, bukan tebal.
const TAB_ICON_STROKE = 1.5;
const TAB_ICON_SIZE = 22;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => (
            <CalendarDays color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color }) => (
            <ArrowLeftRight color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => (
            <User color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE} />
          ),
        }}
      />
    </Tabs>
  );
}
