import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/Colors';
import { storage } from '@/services/storage';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await storage.getUser<User>();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
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
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Points Card */}
            <View style={styles.pointsCard}>
              <Text style={styles.pointsValue}>{user?.points ?? 0} Points</Text>
              <Text style={styles.pointsLabel}>sur ta cagnotte</Text>
            </View>
          </View>

          {/* Right Column (2 stacked cards) */}
          <View style={styles.rightColumn}>
            {/* Blue Card with Piggy Bank */}
            <View style={styles.blueCard}>
              <Image
                source={require('@/assets/images/tirelire.png')}
                style={styles.piggyImage}
                resizeMode="contain"
              />
            </View>
            {/* Yellow Card */}
            <View style={styles.yellowCard} />
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
});
