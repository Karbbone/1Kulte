import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

const renderTabBar = (props: any) => <CustomTabBar {...props} />;

export default function TabLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="trails" />
      <Tabs.Screen name="rewards" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
