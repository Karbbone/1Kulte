import { useCallback, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import { api, CulturalPlace, CulturalPlaceType, Favorite } from "@/services/api";
import { CulturalPlaceCard } from "@/components/CulturalPlaceCard";

type ViewMode = "carte" | "liste";

const CATEGORIES: { type: CulturalPlaceType | "all"; label: string; color: string; borderColor: string }[] = [
  { type: "art", label: "ART", color: "#FFF8F0", borderColor: "#E07B39" },
  { type: "patrimoine", label: "PATRIMOINE", color: "#F0F4FF", borderColor: "#3F94BB" },
  { type: "mythe", label: "MYTHE", color: "#F5FFF5", borderColor: "#4CAF50" },
  { type: "musique", label: "MUSIQUE", color: "#FFF0F5", borderColor: "#9C27B0" },
];

const MARKER_COLORS: Record<CulturalPlaceType, string> = {
  art: "#E07B39",
  patrimoine: "#3F94BB",
  mythe: "#4CAF50",
  musique: "#9C27B0",
};

const INITIAL_REGION: Region = {
  latitude: 47.9,
  longitude: -2.8,
  latitudeDelta: 2.5,
  longitudeDelta: 2.5,
};

export default function SearchScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("carte");
  const [selectedCategory, setSelectedCategory] = useState<CulturalPlaceType | "all">("all");
  const [places, setPlaces] = useState<CulturalPlace[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const userToken = await storage.getToken();
      setToken(userToken);

      const [allPlaces, userFavorites] = await Promise.all([
        api.getCulturalPlaces(),
        userToken ? api.getFavorites(userToken) : Promise.resolve([]),
      ]);

      setPlaces(allPlaces);
      setFavorites(userFavorites);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (placeId: string) => {
    if (!token) return;

    const existingFavorite = favorites.find(
      (f) => f.culturalPlace.id === placeId
    );

    try {
      if (existingFavorite) {
        await api.removeFavorite(token, placeId);
        setFavorites((prev) =>
          prev.filter((f) => f.culturalPlace.id !== placeId)
        );
      } else {
        const newFavorite = await api.addFavorite(token, placeId);
        setFavorites((prev) => [...prev, newFavorite]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (placeId: string): boolean => {
    return favorites.some((f) => f.culturalPlace.id === placeId);
  };

  const filteredPlaces = places.filter((place) => {
    const matchesCategory = selectedCategory === "all" || place.type === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearchPress = () => {
    setShowSearchBar(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleCloseSearch = () => {
    setShowSearchBar(false);
    setSearchQuery("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      {showSearchBar ? (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={20} color={brandColors.textDark} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Rechercher un lieu..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </Pressable>
            )}
          </View>
          <Pressable onPress={handleCloseSearch} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.header}>
          {/* Toggle Carte/Liste */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleButton,
                viewMode === "carte" && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode("carte")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "carte" && styles.toggleTextActive,
                ]}
              >
                Carte
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                viewMode === "liste" && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode("liste")}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "liste" && styles.toggleTextActive,
                ]}
              >
                Liste
              </Text>
            </Pressable>
          </View>

          {/* Icônes Recherche et Filtre */}
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconButton} onPress={handleSearchPress}>
              <Ionicons name="search-outline" size={24} color={brandColors.textDark} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="options-outline" size={24} color={brandColors.textDark} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Filtres par catégorie */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.type;
          return (
            <Pressable
              key={category.type}
              style={[
                styles.categoryChip,
                {
                  borderColor: category.borderColor,
                  backgroundColor: isSelected ? category.borderColor : "transparent",
                },
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === category.type ? "all" : category.type
              )}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? brandColors.backgroundLight : category.borderColor },
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Contenu */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      ) : viewMode === "liste" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPlaces.map((place) => (
            <CulturalPlaceCard
              key={place.id}
              place={place}
              isFavorite={isFavorite(place.id)}
              onToggleFavorite={handleToggleFavorite}
              fullWidth
            />
          ))}
        </ScrollView>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              title={place.name}
              description={`${place.postCode} - ${place.city}`}
              pinColor={MARKER_COLORS[place.type]}
              onCalloutPress={() => {
                router.push({
                  pathname: "/cultural-place/[id]",
                  params: { id: place.id, placeData: JSON.stringify(place) },
                });
              }}
            />
          ))}
        </MapView>
      )}
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
    paddingVertical: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: brandColors.textDark,
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: brandColors.textDark,
    fontWeight: "500",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E8E4DC",
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: brandColors.textDark,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: brandColors.textDark,
  },
  toggleTextActive: {
    color: "white",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  categoriesScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
  },
  categoryChip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  categoryText: {
    fontSize: 20,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  map: {
    flex: 1,
  },
});
