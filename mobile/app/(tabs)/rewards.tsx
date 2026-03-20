import { useCallback, useMemo, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import { api, Reward } from "@/services/api";

type RewardCategory = "litterature" | "musees" | "musique" | "cinema";

interface CategoryCard {
  id: RewardCategory;
  label: string;
  color: string;
}

const CATEGORY_CARDS: CategoryCard[] = [
  { id: "litterature", label: "LITTERATURE", color: "#F7B9B4" },
  { id: "musees", label: "MUSEES", color: "#F26A13" },
  { id: "musique", label: "MUSIQUE", color: "#3F94BB" },
  { id: "cinema", label: "CINEMA", color: "#F4C64E" },
];

const CATEGORY_HINTS: Record<RewardCategory, string[]> = {
  litterature: ["livre", "book", "roman", "bd", "manga", "lecture"],
  musees: ["musee", "museum", "expo", "exposition", "galerie"],
  musique: ["musique", "music", "album", "vinyl", "concert", "cd"],
  cinema: ["cinema", "film", "movie", "ticket", "seance", "serie"],
};

export default function RewardsScreen() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | "all">("all");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsList, userToken] = await Promise.all([
        api.getRewards(),
        storage.getToken(),
      ]);

      setRewards(rewardsList);
      setToken(userToken);
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const hashToCategory = (value: string): RewardCategory => {
    const categories: RewardCategory[] = ["litterature", "musees", "musique", "cinema"];
    const sum = value.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return categories[sum % categories.length];
  };

  const getRewardCategory = (reward: Reward): RewardCategory => {
    const searchable = `${reward.title} ${reward.description || ""}`.toLowerCase();

    for (const category of Object.keys(CATEGORY_HINTS) as RewardCategory[]) {
      if (CATEGORY_HINTS[category].some((hint) => searchable.includes(hint))) {
        return category;
      }
    }

    return hashToCategory(reward.id || reward.title);
  };

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      if (selectedCategory === "all") return true;
      return getRewardCategory(reward) === selectedCategory;
    });
  }, [rewards, selectedCategory]);

  const toggleCategory = (category: RewardCategory) => {
    setSelectedCategory((prev) => (prev === category ? "all" : category));
  };

  const handleAddToCart = async (reward: Reward) => {
    if (!token) {
      Alert.alert("Connexion requise", "Connectez-vous pour ajouter des articles au panier.");
      return;
    }

    try {
      setAdding(reward.id);
      await api.addRewardToCart(token, reward.id, 1);
      Alert.alert("Ajoute au panier", `${reward.title} a ete ajoute.`);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'ajouter au panier.");
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
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
        <View style={styles.topActions}>
          <Pressable style={styles.iconCircle}>
            <Ionicons name="search-outline" size={24} color={brandColors.textDark} />
          </Pressable>
          <Pressable style={styles.iconCircle} onPress={() => router.push("/cart")}>
            <Ionicons name="bag-handle-outline" size={22} color={brandColors.textDark} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Ionicons name="chevron-forward" size={28} color={brandColors.textDark} />
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORY_CARDS.map((category) => {
            const selected = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                  selected && styles.categoryCardSelected,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryLabel}>{category.label}</Text>
                <Image
                  source={require("@/assets/images/tirelire.png")}
                  style={styles.categoryPig}
                  resizeMode="contain"
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.popularHeader}>
          <Text style={styles.popularTitle}>Populaire</Text>
        </View>

        {filteredRewards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={48} color={brandColors.textDark} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>Aucun produit pour cette categorie</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredRewards.map((reward) => {
              const rewardCategory = getRewardCategory(reward);
              const categoryLabel = CATEGORY_CARDS.find((c) => c.id === rewardCategory)?.label || "REWARD";
              const addingInProgress = adding === reward.id;

              return (
                <View key={reward.id} style={styles.productCard}>
                  {reward.imageUrl ? (
                    <Image source={{ uri: reward.imageUrl }} style={styles.productImage} resizeMode="contain" />
                  ) : (
                    <View style={[styles.productImage, styles.productImageFallback]}>
                      <Ionicons name="gift-outline" size={34} color={brandColors.textDark} style={{ opacity: 0.3 }} />
                    </View>
                  )}

                  {addingInProgress && (
                    <View style={styles.addingOverlay}>
                      <ActivityIndicator size="small" color="#FFF" />
                    </View>
                  )}

                  <Text style={styles.productName} numberOfLines={2}>
                    {reward.title}
                  </Text>
                  <Text style={styles.productSubtitle} numberOfLines={1}>
                    {reward.description || categoryLabel}
                  </Text>

                  <View style={styles.footerRow}>
                    <Text style={styles.productPrice}>{reward.cost}€</Text>
                    <Pressable
                      style={styles.addButton}
                      onPress={() => handleAddToCart(reward)}
                      disabled={addingInProgress}
                    >
                      <Ionicons name="add" size={18} color={brandColors.textDark} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EBE5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginBottom: 26,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "#3B3433",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0EBE5",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: brandColors.textDark,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  categoryCard: {
    width: "48.5%",
    minHeight: 110,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  categoryCardSelected: {
    borderWidth: 3,
    borderColor: "#3B3433",
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    maxWidth: "62%",
  },
  categoryPig: {
    position: "absolute",
    right: -4,
    bottom: -8,
    width: 108,
    height: 90,
  },
  popularHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  popularTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: brandColors.textDark,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 44,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48.5%",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    minHeight: 238,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 122,
    marginBottom: 8,
  },
  productImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  addingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
    minHeight: 40,
  },
  productSubtitle: {
    fontSize: 11,
    color: "#2D2B2B",
    opacity: 0.9,
    marginBottom: 8,
  },
  footerRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "900",
    color: "#3F94BB",
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDC958",
  },
});
