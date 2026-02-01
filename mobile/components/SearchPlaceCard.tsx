import { StyleSheet, View, Image, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { brandColors } from "@/constants/Colors";
import { CulturalPlace, CulturalPlaceType } from "@/services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 200;

// Icônes SVG par type (représentées par des images overlay)
const typeIcons: Record<CulturalPlaceType, { icon: string; color: string }> = {
  art: { icon: "🏺", color: "#E07B39" },
  patrimoine: { icon: "🏰", color: "#6B5B95" },
  mythe: { icon: "⚔️", color: "#3F94BB" },
  musique: { icon: "🎵", color: "#4CAF50" },
};

// Images de fond par type
const typeBackgrounds: Record<CulturalPlaceType, string> = {
  art: "#D4845C",
  patrimoine: "#8B7BA8",
  mythe: "#4A90A4",
  musique: "#5D9B6B",
};

interface SearchPlaceCardProps {
  place: CulturalPlace;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  onPress?: () => void;
}

export function SearchPlaceCard({
  place,
  isFavorite,
  onToggleFavorite,
  onPress,
}: SearchPlaceCardProps) {
  const testImage = { uri: `https://picsum.photos/seed/${place.id}/800/400` };
  const typeConfig = typeIcons[place.type] || typeIcons.patrimoine;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={testImage} style={styles.image} resizeMode="cover" />

      {/* Overlay teinté selon le type */}
      <View style={[styles.overlay, { backgroundColor: typeBackgrounds[place.type] + "80" }]} />

      {/* Bouton Like */}
      <Pressable
        style={styles.likeButton}
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite(place.id);
        }}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#FF6B6B" : brandColors.textDark}
        />
      </Pressable>

      {/* Icône du type en overlay */}
      <View style={styles.typeIconContainer}>
        <TypeIcon type={place.type} />
      </View>

      {/* Barre d'info en bas */}
      <View style={styles.infoBar}>
        <View style={styles.infoContent}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={14}
              color={brandColors.accentOrange}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {place.postCode} -{place.city}
            </Text>
          </View>
        </View>
        <View style={styles.decorIcon}>
          <DecorativeIcon type={place.type} />
        </View>
      </View>
    </Pressable>
  );
}

// Composant pour l'icône du type (grande, en overlay)
function TypeIcon({ type }: { type: CulturalPlaceType }) {
  switch (type) {
    case "art":
      return (
        <View style={styles.typeIcon}>
          {/* Vase/Amphore stylisé */}
          <View style={styles.vaseIcon}>
            <View style={styles.vaseTop} />
            <View style={styles.vaseBody}>
              <View style={styles.vaseWave} />
              <View style={styles.vaseWave2} />
            </View>
          </View>
        </View>
      );
    case "patrimoine":
      return (
        <View style={styles.typeIcon}>
          {/* Tour/Château stylisé */}
          <View style={styles.castleIcon}>
            <View style={styles.castleTower} />
            <View style={styles.castleCrenel} />
            <View style={styles.castleWindow} />
          </View>
        </View>
      );
    case "mythe":
      return (
        <View style={styles.typeIcon}>
          {/* Épée stylisée */}
          <View style={styles.swordIcon}>
            <View style={styles.swordBlade} />
            <View style={styles.swordGuard} />
            <View style={styles.swordHandle} />
          </View>
        </View>
      );
    case "musique":
      return (
        <View style={styles.typeIcon}>
          {/* Note de musique stylisée */}
          <View style={styles.musicIcon}>
            <View style={styles.musicNote} />
            <View style={styles.musicStem} />
          </View>
        </View>
      );
    default:
      return null;
  }
}

// Petite icône décorative en bas à droite
function DecorativeIcon({ type }: { type: CulturalPlaceType }) {
  return (
    <View style={styles.smallDecorIcon}>
      <View style={[styles.decorLine, { transform: [{ rotate: "-45deg" }] }]} />
      <View style={[styles.decorLine, { transform: [{ rotate: "45deg" }], marginLeft: 3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#F5F0E6",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  likeButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    bottom: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIcon: {
    width: 100,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F4EDE5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoContent: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
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
    fontSize: 13,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  decorIcon: {
    marginLeft: 10,
  },
  smallDecorIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  decorLine: {
    width: 3,
    height: 16,
    backgroundColor: brandColors.accentOrange,
    borderRadius: 2,
  },
  // Vase/Art icon styles
  vaseIcon: {
    alignItems: "center",
  },
  vaseTop: {
    width: 30,
    height: 8,
    backgroundColor: "#F5F0E6",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  vaseBody: {
    width: 50,
    height: 80,
    backgroundColor: "#F5F0E6",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  vaseWave: {
    width: 30,
    height: 3,
    backgroundColor: brandColors.accentOrange,
    borderRadius: 2,
    marginBottom: 8,
  },
  vaseWave2: {
    width: 35,
    height: 3,
    backgroundColor: brandColors.accentOrange,
    borderRadius: 2,
  },
  // Castle/Patrimoine icon styles
  castleIcon: {
    alignItems: "center",
  },
  castleTower: {
    width: 40,
    height: 70,
    backgroundColor: "#F5F0E6",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  castleCrenel: {
    position: "absolute",
    top: 0,
    width: 50,
    height: 15,
    backgroundColor: "#F5F0E6",
    borderRadius: 3,
  },
  castleWindow: {
    position: "absolute",
    top: 30,
    width: 12,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  // Sword/Mythe icon styles
  swordIcon: {
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  swordBlade: {
    width: 12,
    height: 70,
    backgroundColor: "#F5F0E6",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  swordGuard: {
    width: 40,
    height: 8,
    backgroundColor: "#F5F0E6",
    borderRadius: 4,
    marginTop: -2,
  },
  swordHandle: {
    width: 10,
    height: 25,
    backgroundColor: "#F5F0E6",
    borderRadius: 3,
    marginTop: 2,
  },
  // Music icon styles
  musicIcon: {
    alignItems: "center",
  },
  musicNote: {
    width: 25,
    height: 25,
    backgroundColor: "#F5F0E6",
    borderRadius: 12.5,
  },
  musicStem: {
    position: "absolute",
    right: -5,
    top: -30,
    width: 6,
    height: 50,
    backgroundColor: "#F5F0E6",
    borderRadius: 3,
  },
});
