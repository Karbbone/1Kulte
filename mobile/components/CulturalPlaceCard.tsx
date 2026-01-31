import { StyleSheet, View, Image, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { brandColors } from "@/constants/Colors";
import { CulturalPlace, CulturalPlaceType } from "@/services/api";

const CARD_WIDTH = 270;
const CARD_HEIGHT = 190;

// Images de fond par type
const typeBackgrounds: Record<CulturalPlaceType, any> = {
  art: require("@/assets/images/cultural_art.png"),
  patrimoine: require("@/assets/images/cultral_patrimoine.png"),
  mythe: require("@/assets/images/cultural_mythe.png"),
  musique: require("@/assets/images/cultural_.musique.png"),
};

interface CulturalPlaceCardProps {
  place: CulturalPlace;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
}

export function CulturalPlaceCard({
  place,
  isFavorite,
  onToggleFavorite,
}: CulturalPlaceCardProps) {
  // Test avec une image externe pour debug (en attendant les nouvelles images)
  const testImage = { uri: `https://picsum.photos/seed/${place.id}/400/284` };

  return (
    <View style={styles.card}>
      <Image source={testImage} style={styles.image} resizeMode="cover" />

      {/* Bouton Like */}
      <Pressable
        style={styles.likeButton}
        onPress={() => onToggleFavorite(place.id)}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#FF6B6B" : brandColors.textDark}
        />
      </Pressable>

      {/* Barre d'info en bas */}
      <View style={styles.infoBar}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={brandColors.textDark}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {place.postCode} - {place.city}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
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
    // Optionnel : ombre légère
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: brandColors.textDark,
    opacity: 0.7,
  },
});
