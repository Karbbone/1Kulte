import { useCallback, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import { api, Favorite, TrailHistoryItem, UserReward } from "@/services/api";
import { CulturalPlaceCard } from "@/components/CulturalPlaceCard";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  profilePictureUrl?: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [trailHistory, setTrailHistory] = useState<TrailHistoryItem[]>([]);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const [userData, userToken] = await Promise.all([
        storage.getUser<User>(),
        storage.getToken(),
      ]);

      if (userData && userToken) {
        const freshUser = await api.getUserById(userToken, userData.id);
        setUser(freshUser);
        await storage.setUser(freshUser);
        setToken(userToken);
      } else {
        setUser(userData);
        setToken(userToken);
      }

      if (userToken) {
        const [userFavorites, userTrailHistory, userRewards] = await Promise.all([
          api.getFavorites(userToken),
          api.getTrailHistory(userToken),
          api.getMyRewards(userToken),
        ]);
        setFavorites(userFavorites);
        setTrailHistory(userTrailHistory);
        setMyRewards(userRewards);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleToggleFavorite = async (placeId: string) => {
    if (!token) return;

    const existingFavorite = favorites.find(
      (f) => f.culturalPlace.id === placeId,
    );

    try {
      if (existingFavorite) {
        await api.removeFavorite(token, placeId);
        setFavorites((prev) =>
          prev.filter((f) => f.culturalPlace.id !== placeId),
        );
      } else {
        const newFavorite = await api.addFavorite(token, placeId);
        setFavorites((prev) => [...prev, newFavorite]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleChangeProfilePicture = async () => {
    if (!user || !token) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "L'accès à la galerie est nécessaire pour changer votre photo de profil.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      const updatedUser = await api.uploadProfilePicture(
        token,
        user.id,
        result.assets[0].uri,
      );
      setUser(updatedUser);
      await storage.setUser(updatedUser);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la photo de profil.");
    }
  };

  const isFavorite = (placeId: string): boolean => {
    return favorites.some((f) => f.culturalPlace.id === placeId);
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Utilisateur";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte utilisateur */}
        <View style={styles.userCardContainer}>
          <View style={styles.userCard}>
            <Pressable style={styles.avatarContainer} onPress={handleChangeProfilePicture}>
              {user?.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons
                  name="person-outline"
                  size={40}
                  color={brandColors.textDark}
                />
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </Pressable>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userPoints}>{user?.points ?? 0} Points</Text>
            </View>
          </View>
        </View>

        {/* Section Favoris */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favoris</Text>
          {favorites.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {favorites.map((fav) => (
                <CulturalPlaceCard
                  key={fav.culturalPlace.id}
                  place={fav.culturalPlace}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Aucun favori</Text>
          )}
        </View>

        {/* Section Historique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          {trailHistory.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {trailHistory.map((item) => (
                <CulturalPlaceCard
                  key={item.trail.id}
                  place={item.culturalPlace}
                  isFavorite={isFavorite(item.culturalPlace.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Aucun historique</Text>
          )}
        </View>

        {/* Section Mes achats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes achats</Text>
          {myRewards.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {myRewards.map((ur) => (
                <View key={ur.id} style={styles.purchaseCard}>
                  {ur.reward.imageUrl ? (
                    <Image
                      source={{ uri: ur.reward.imageUrl }}
                      style={styles.purchaseImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.purchaseImage, styles.purchasePlaceholder]}>
                      <Ionicons
                        name="gift-outline"
                        size={40}
                        color={brandColors.textDark}
                        style={{ opacity: 0.3 }}
                      />
                    </View>
                  )}
                  <View style={styles.purchaseInfoBar}>
                    <Text style={styles.purchaseName} numberOfLines={1}>
                      {ur.reward.title}
                    </Text>
                    <View style={styles.purchaseCostRow}>
                      <Ionicons
                        name="star"
                        size={14}
                        color={brandColors.textDark}
                      />
                      <Text style={styles.purchaseCostText}>
                        {ur.reward.cost} pts
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Aucun achat</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.backgroundLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: brandColors.cardYellow,
    borderRadius: 20,
    padding: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brandColors.accentOrange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: brandColors.cardYellow,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.textDark,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  emptyText: {
    fontSize: 14,
    color: brandColors.textDark,
    opacity: 0.6,
    paddingHorizontal: 20,
  },
  purchaseCard: {
    width: 270,
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  purchaseImage: {
    width: "100%",
    height: "100%",
  },
  purchasePlaceholder: {
    backgroundColor: "#F0EBE3",
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseInfoBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#F4EDE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  purchaseName: {
    fontSize: 16,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  purchaseCostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  purchaseCostText: {
    fontSize: 12,
    color: brandColors.textDark,
    opacity: 0.7,
  },
});
