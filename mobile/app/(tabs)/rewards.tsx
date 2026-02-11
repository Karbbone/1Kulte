import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
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

      setRewards(rewardsList);
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boutique</Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={16} color={brandColors.textDark} />
          <Text style={styles.pointsText}>{userPoints} pts</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rewards.length === 0 ? (
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
          rewards.map((reward) => (
            <View key={reward.id} style={styles.card}>
              {reward.imageUrl ? (
                <Image
                  source={{ uri: reward.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons
                    name="gift-outline"
                    size={48}
                    color={brandColors.textDark}
                    style={{ opacity: 0.3 }}
                  />
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{reward.title}</Text>
                {reward.description ? (
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {reward.description}
                  </Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <View style={styles.costBadge}>
                    <Ionicons
                      name="star"
                      size={14}
                      color={brandColors.textDark}
                    />
                    <Text style={styles.costText}>{reward.cost} pts</Text>
                  </View>
                  <Pressable
                    style={[
                      styles.buyButton,
                      userPoints < reward.cost && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handlePurchase(reward)}
                    disabled={purchasing === reward.id}
                  >
                    {purchasing === reward.id ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.buyButtonText}>Acheter</Text>
                    )}
                  </Pressable>
                </View>
              </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: brandColors.textDark,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
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
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#F0EBE3",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: brandColors.textDark,
    opacity: 0.7,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  costText: {
    fontSize: 16,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  buyButton: {
    backgroundColor: brandColors.accentOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  buyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
