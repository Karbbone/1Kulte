import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { brandColors } from '@/constants/Colors';
import { storage } from '@/services/storage';
import { api, CulturalPlace, Favorite } from '@/services/api';
import { CulturalPlaceCard } from '@/components/CulturalPlaceCard';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CulturalPlace[]>([]);
  const [popular, setPopular] = useState<CulturalPlace[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [userData, userToken] = await Promise.all([
        storage.getUser<User>(),
        storage.getToken(),
      ]);
      setUser(userData);
      setToken(userToken);

      const popularPlaces = await api.getPopularPlaces();
      setPopular(popularPlaces);

      if (userToken) {
        const [recommendedPlaces, userFavorites] = await Promise.all([
          api.getRecommendations(userToken),
          api.getFavorites(userToken),
        ]);
        setRecommendations(recommendedPlaces);
        setFavorites(userFavorites);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setLoadingPlaces(false);
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
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (placeId: string): boolean => {
    return favorites.some((f) => f.culturalPlace.id === placeId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.primary} />
      </View>
    );
  }

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Utilisateur';

  const renderPlacesList = (places: CulturalPlace[]) => {
    if (places.length === 0) {
      return <Text style={styles.emptyText}>Aucun lieu disponible</Text>;
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.placesList}
      >
        {places.map((place) => (
          <CulturalPlaceCard
            key={place.id}
            place={place}
            isFavorite={isFavorite(place.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bonjour {displayName}</Text>
            <Text style={styles.subtitle}>À quoi on joue aujourd'hui ?</Text>
          </View>
          <View style={styles.avatarCircle} />
        </View>

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.pointsCard}>
              <Text style={styles.pointsValue}>{user?.points ?? 0} Points</Text>
              <Text style={styles.pointsLabel}>sur ta cagnotte</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.blueCard}>
              <Image
                source={require('@/assets/images/tirelire.png')}
                style={styles.piggyImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.yellowCard} />
          </View>
        </View>

        {/* Recommandations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommandations</Text>
            <Pressable>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={brandColors.textDark}
              />
            </Pressable>
          </View>

          {loadingPlaces ? (
            <ActivityIndicator
              size="small"
              color={brandColors.primary}
              style={styles.sectionLoader}
            />
          ) : (
            renderPlacesList(recommendations)
          )}
        </View>

        {/* Populaire Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populaire</Text>
            <Pressable>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={brandColors.textDark}
              />
            </Pressable>
          </View>

          {loadingPlaces ? (
            <ActivityIndicator
              size="small"
              color={brandColors.primary}
              style={styles.sectionLoader}
            />
          ) : (
            renderPlacesList(popular)
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
  loadingContainer: {
    flex: 1,
    backgroundColor: brandColors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: brandColors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: brandColors.accentOrange,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    height: 200,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  leftColumn: {
    flex: 1,
  },
  pointsCard: {
    flex: 1,
    backgroundColor: brandColors.cardPink,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'flex-start',
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '700',
    color: brandColors.textDark,
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 14,
    color: brandColors.textDark,
    opacity: 0.8,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  blueCard: {
    flex: 1,
    backgroundColor: brandColors.cardBlue,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  piggyImage: {
    width: 180,
    height: 180,
    marginBottom: -15,
    marginTop: -50,
  },
  yellowCard: {
    flex: 1,
    backgroundColor: brandColors.cardYellow,
    borderRadius: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: brandColors.textDark,
  },
  sectionLoader: {
    marginVertical: 40,
  },
  placesList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  emptyText: {
    fontSize: 14,
    color: brandColors.textDark,
    opacity: 0.6,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
