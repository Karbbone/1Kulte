import { brandColors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

type TabBarProps = {
  state: any;
  navigation: any;
};

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const tabs: TabConfig[] = [
  {
    name: "index",
    label: "Accueil",
    icon: "home",
    iconOutline: "home-outline",
  },
  {
    name: "search",
    label: "Parcourir",
    icon: "search",
    iconOutline: "search-outline",
  },
  {
    name: "trails",
    label: "Scan",
    icon: "qr-code",
    iconOutline: "qr-code-outline",
  },
  {
    name: "rewards",
    label: "Boutique",
    icon: "gift",
    iconOutline: "gift-outline",
  },
  {
    name: "profile",
    label: "Profil",
    icon: "person",
    iconOutline: "person-outline",
  },
];

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
            >
              <Ionicons
                name={isFocused ? tab.icon : tab.iconOutline}
                size={22}
                color={isFocused ? brandColors.textCream : brandColors.background}
              />
              {isFocused && <Text style={styles.tabLabel}>{tab.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F0E6",
    paddingBottom: 34,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: brandColors.background,
  },
  tabLabel: {
    color: brandColors.textCream,
    fontSize: 13,
    fontWeight: "600",
  },
});
