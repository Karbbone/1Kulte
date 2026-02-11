import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import { api, Reward } from "@/services/api";

export default function RewardsScreen() {
  const [rewardsByPrice, setRewardsByPrice] = useState<{ cost: number; rewards: Reward[] }[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsList, userToken, userData] = await Promise.all([
        api.getRewards(),
        storage.getToken(),
        storage.getUser<{ id: string; points: number }>(),
      ]);

      // Grouper par coût et trier par coût croissant
      const grouped = new Map<number, Reward[]>();
      for (const reward of rewardsList) {
        const list = grouped.get(reward.cost) || [];
        list.push(reward);
        grouped.set(reward.cost, list);
      }
      const sortedGroups = Array.from(grouped.entries())
        .sort(([a], [b]) => a - b)
        .map(([cost, rewards]) => ({ cost, rewards }));
      setRewardsByPrice(sortedGroups);
      setToken(userToken);

      if (userData && userToken) {
        const freshUser = await api.getUserById(userToken, userData.id);
        setUserPoints(freshUser.points);
      }
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (!token) {
      Alert.alert("Connexion requise", "Connectez-vous pour acheter des récompenses.");
      return;
    }

    if (userPoints < reward.cost) {
      Alert.alert(
        "Points insuffisants",
        `Vous avez ${userPoints} points mais cette récompense coûte ${reward.cost} points.`,
      );
      return;
    }

    Alert.alert(
      "Confirmer l'achat",
      `Acheter "${reward.title}" pour ${reward.cost} points ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Acheter",
          onPress: () => confirmPurchase(reward),
        },
      ],
    );
  };

  const confirmPurchase = async (reward: Reward) => {
    if (!token) return;

    try {
      setPurchasing(reward.id);
      await api.purchaseReward(token, reward.id);
      setUserPoints((prev) => prev - reward.cost);
      Alert.alert("Achat réussi", `Vous avez obtenu "${reward.title}" !`);
    } catch (error: any) {
      const message = error?.message || "Impossible de finaliser l'achat.";
      Alert.alert("Erreur", message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Boutique</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Boutique</Text>
            <Text style={styles.headerSubtitle}>
              Échange tes points contre des récompenses
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={16} color={brandColors.textDark} />
            <Text style={styles.pointsText}>{userPoints} pts</Text>
          </View>
        </View>

        {rewardsByPrice.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bag-outline"
              size={60}
              color={brandColors.textDark}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyText}>
              Aucun produit disponible pour le moment
            </Text>
          </View>
        ) : (
          rewardsByPrice.map((group) => (
            <View key={group.cost} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{group.cost} points</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rewardsList}
              >
                {group.rewards.map((reward) => (
                  <Pressable
                    key={reward.id}
                    style={styles.card}
                    onPress={() => handlePurchase(reward)}
                    disabled={purchasing === reward.id}
                  >
                    {reward.imageUrl ? (
                      <Image
                        source={{ uri: reward.imageUrl }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                        <Ionicons
                          name="gift-outline"
                          size={40}
                          color={brandColors.textDark}
                          style={{ opacity: 0.3 }}
                        />
                      </View>
                    )}

                    {/* Loading overlay */}
                    {purchasing === reward.id && (
                      <View style={styles.purchasingOverlay}>
                        <ActivityIndicator size="small" color="#FFF" />
                      </View>
                    )}

                    {/* Info bar */}
                    <View style={styles.infoBar}>
                      <Text style={styles.rewardName} numberOfLines={1}>
                        {reward.title}
                      </Text>
                    </View>

                    {/* Badge insuffisant */}
                    {userPoints < reward.cost && (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={14} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: brandColors.cardYellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.6,
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  rewardsList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  card: {
    width: 200,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    backgroundColor: "#F0EBE3",
    justifyContent: "center",
    alignItems: "center",
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoBar: {
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
  rewardName: {
    fontSize: 16,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  lockedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
