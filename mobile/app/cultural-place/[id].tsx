import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import { api, CulturalPlace, CulturalPlaceType } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 280;

const TYPE_CONFIG: Record<CulturalPlaceType, { label: string; color: string }> = {
  art: { label: "ART", color: "#E07B39" },
  patrimoine: { label: "PATRIMOINE", color: "#3F94BB" },
  mythe: { label: "MYTHE", color: "#4CAF50" },
  musique: { label: "MUSIQUE", color: "#9C27B0" },
};

export default function CulturalPlaceDetailScreen() {
  const { id, placeData } = useLocalSearchParams<{ id: string; placeData: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<CulturalPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id, placeData])
  );

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Récupérer les données du lieu depuis les params
      if (placeData) {
        const parsedPlace = JSON.parse(placeData) as CulturalPlace;
        setPlace(parsedPlace);
      }

      // Charger le token et les favoris
      const userToken = await storage.getToken();
      setToken(userToken);

      if (userToken) {
        const favorites = await api.getFavorites(userToken);
        const isFav = favorites.some((f) => f.culturalPlace.id === id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error("Error loading place:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || !id) return;

    try {
      if (isFavorite) {
        await api.removeFavorite(token, id);
        setIsFavorite(false);
      } else {
        await api.addFavorite(token, id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleStartEnigma = () => {
    router.push({
      pathname: "/(tabs)/trails",
      params: { placeId: id, placeName: place?.name },
    });
  };

  if (loading || !place) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Pressable style={styles.backButtonLoading} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={brandColors.textDark} />
          </Pressable>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeConfig = TYPE_CONFIG[place.type] || { label: "LIEU", color: "#666666" };
  const imageUri = `https://picsum.photos/seed/${place.id}/800/600`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image avec overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Header overlay */}
          <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={brandColors.textDark} />
            </Pressable>
            <Pressable style={styles.favoriteButton} onPress={handleToggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#FF6B6B" : brandColors.textDark}
              />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {/* Titre */}
          <Text style={styles.title}>{place.name}</Text>

          {/* Badge type */}
          <View style={[styles.typeBadge, { borderColor: typeConfig.color }]}>
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
          </View>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={brandColors.accentOrange} />
            <Text style={styles.locationText}>
              {place.postCode} - {place.city}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{place.description}</Text>

          {/* Coordonnées (optionnel) */}
          {typeof place.latitude === "number" && typeof place.longitude === "number" && (
            <View style={styles.coordsContainer}>
              <Ionicons name="navigate-outline" size={16} color="#999" />
              <Text style={styles.coordsText}>
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bouton fixe en bas */}
      <SafeAreaView style={styles.bottomContainer} edges={["bottom"]}>
        <Pressable style={styles.enigmaButton} onPress={handleStartEnigma}>
          <Ionicons name="qr-code-outline" size={22} color="white" style={styles.enigmaIcon} />
          <Text style={styles.enigmaButtonText}>Débuter l'énigme</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonLoading: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: brandColors.textDark,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: brandColors.textDark,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: brandColors.textDark,
    marginBottom: 24,
  },
  coordsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
  },
  coordsText: {
    fontSize: 14,
    color: "#999",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: brandColors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
  },
  enigmaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brandColors.textDark,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  enigmaIcon: {
    marginRight: 4,
  },
  enigmaButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
});
