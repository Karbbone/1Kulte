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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { api, Reward } from "@/services/api";
import { storage } from "@/services/storage";
import { brandColors } from "@/constants/Colors";

export default function RewardDetailScreen() {
  const router = useRouter();
  const { id, rewardData } = useLocalSearchParams<{ id: string; rewardData?: string }>();

  const [reward, setReward] = useState<Reward | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id, rewardData]),
  );

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const userToken = await storage.getToken();
      setToken(userToken);

      if (rewardData) {
        try {
          const parsed = JSON.parse(rewardData) as Reward;
          setReward(parsed);
          setLoading(false);
          return;
        } catch {
          // Ignore invalid payload and fetch from API.
        }
      }

      const freshReward = await api.getRewardById(id);
      setReward(freshReward);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de charger le produit.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!reward) return;
    if (!token) {
      Alert.alert("Connexion requise", "Connectez-vous pour ajouter ce produit au panier.");
      return;
    }

    try {
      setAdding(true);
      await api.addRewardToCart(token, reward.id, 1);
      Alert.alert("Ajoute au panier", `${reward.title} a ete ajoute au panier.`);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'ajouter au panier.");
    } finally {
      setAdding(false);
    }
  };

  if (loading || !reward) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable style={styles.iconCircle} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={brandColors.textDark} />
        </Pressable>
        <Pressable style={styles.iconCircle} onPress={() => router.push("/cart")}>
          <Ionicons name="bag-handle-outline" size={22} color={brandColors.textDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reward.imageUrl ? (
          <Image source={{ uri: reward.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="gift-outline" size={48} color={brandColors.textDark} style={{ opacity: 0.35 }} />
          </View>
        )}

        <Text style={styles.title}>{reward.title}</Text>
        <Text style={styles.price}>{reward.cost}€</Text>
        <Text style={styles.description}>
          {reward.description || "Produit de la boutique 1Kulte."}
        </Text>
      </ScrollView>

      <SafeAreaView style={styles.bottom} edges={["bottom"]}>
        <Pressable
          style={[styles.addButton, adding && { opacity: 0.7 }]}
          onPress={handleAddToCart}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color={brandColors.textDark} />
          ) : (
            <>
              <Ionicons name="add" size={20} color={brandColors.textDark} />
              <Text style={styles.addButtonText}>Ajouter au panier</Text>
            </>
          )}
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EBE5",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#3B3433",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0EBE5",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: brandColors.textDark,
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: "900",
    color: "#3F94BB",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: brandColors.textDark,
    opacity: 0.9,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#DDD4CC",
    backgroundColor: "#F0EBE5",
  },
  addButton: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#F4C64E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addButtonText: {
    color: brandColors.textDark,
    fontWeight: "800",
    fontSize: 16,
  },
});
