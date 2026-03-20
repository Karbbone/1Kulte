import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  api,
  RelayPointSuggestion,
  RewardCart,
  RewardRelayOption,
} from "@/services/api";
import { storage } from "@/services/storage";
import { brandColors } from "@/constants/Colors";

const HOME_DEFAULT = {
  homeRecipient: "My Digital School",
  homeAddressLine1: "3 Rue Marie Curie",
  homeAddressLine2: "",
  homePostalCode: "56000",
  homeCity: "Plescop",
};

const RELAY_FALLBACK_LAT = 47.6582;
const RELAY_FALLBACK_LNG = -2.7608;

type HomeForm = {
  homeRecipient: string;
  homeAddressLine1: string;
  homeAddressLine2: string;
  homePostalCode: string;
  homeCity: string;
};

const getHomeFormFromCart = (cart: RewardCart | null): HomeForm => ({
  homeRecipient: cart?.homeRecipient || HOME_DEFAULT.homeRecipient,
  homeAddressLine1: cart?.homeAddressLine1 || HOME_DEFAULT.homeAddressLine1,
  homeAddressLine2: cart?.homeAddressLine2 || HOME_DEFAULT.homeAddressLine2,
  homePostalCode: cart?.homePostalCode || HOME_DEFAULT.homePostalCode,
  homeCity: cart?.homeCity || HOME_DEFAULT.homeCity,
});

export default function CartScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<RewardCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [submittingWallet, setSubmittingWallet] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [homeModalVisible, setHomeModalVisible] = useState(false);
  const [relayModalVisible, setRelayModalVisible] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  const [homeForm, setHomeForm] = useState<HomeForm>(getHomeFormFromCart(null));
  const [relayOptionDraft, setRelayOptionDraft] =
    useState<RewardRelayOption>("standard");
  const [relayPoints, setRelayPoints] = useState<RelayPointSuggestion[]>([]);
  const [selectedRelayPointId, setSelectedRelayPointId] = useState<string | null>(
    null,
  );
  const [loadingRelayPoints, setLoadingRelayPoints] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, []),
  );

  const selectedRelayPoint = useMemo(
    () => relayPoints.find((item) => item.id === selectedRelayPointId) || null,
    [relayPoints, selectedRelayPointId],
  );

  const loadCart = async () => {
    try {
      setLoading(true);
      const userToken = await storage.getToken();
      setToken(userToken);

      if (!userToken) {
        setCart(null);
        return;
      }

      const cartData = await api.getRewardCart(userToken);
      setCart(cartData);
      setHomeForm(getHomeFormFromCart(cartData));
      setRelayOptionDraft(cartData.relayOption || "standard");
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de charger le panier.");
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!token || !cart) return;

    try {
      setUpdatingItemId(itemId);
      if (quantity <= 0) {
        const nextCart = await api.removeRewardCartItem(token, itemId);
        setCart(nextCart);
      } else {
        const nextCart = await api.updateRewardCartItem(token, itemId, quantity);
        setCart(nextCart);
      }
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de mettre a jour le panier.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const openHomeModal = () => {
    setHomeForm(getHomeFormFromCart(cart));
    setHomeModalVisible(true);
  };

  const saveHomeDelivery = async () => {
    if (!token) return;

    if (!homeForm.homeAddressLine1.trim() || !homeForm.homePostalCode.trim() || !homeForm.homeCity.trim()) {
      Alert.alert("Adresse incomplete", "Renseigne au minimum adresse, code postal et ville.");
      return;
    }

    try {
      setSavingDelivery(true);
      const nextCart = await api.updateRewardCartDelivery(token, {
        deliveryMode: "home",
        homeRecipient: homeForm.homeRecipient.trim(),
        homeAddressLine1: homeForm.homeAddressLine1.trim(),
        homeAddressLine2: homeForm.homeAddressLine2.trim(),
        homePostalCode: homeForm.homePostalCode.trim(),
        homeCity: homeForm.homeCity.trim(),
      });
      setCart(nextCart);
      setHomeModalVisible(false);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'enregistrer l'adresse.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      const geolocation = globalThis.navigator?.geolocation;
      if (!geolocation) {
        reject(new Error("Geolocalisation indisponible"));
        return;
      }

      geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      );
    });
  };

  const loadNearbyRelayPoints = async () => {
    if (!token) return;

    try {
      setLoadingRelayPoints(true);

      let latitude = RELAY_FALLBACK_LAT;
      let longitude = RELAY_FALLBACK_LNG;

      try {
        const position = await getCurrentPosition();
        latitude = position.latitude;
        longitude = position.longitude;
      } catch {
        Alert.alert(
          "Position non disponible",
          "On te propose les points relais proches de Vannes par defaut.",
        );
      }

      const nearby = await api.getNearbyRelayPoints(token, latitude, longitude);
      setRelayPoints(nearby);
      setSelectedRelayPointId((prev) => prev || nearby[0]?.id || null);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de charger les points relais.");
    } finally {
      setLoadingRelayPoints(false);
    }
  };

  const openRelayModal = async () => {
    setRelayModalVisible(true);
    setRelayOptionDraft(cart?.relayOption || "standard");
    setSelectedRelayPointId(null);
    await loadNearbyRelayPoints();
  };

  const saveRelayDelivery = async () => {
    if (!token || !selectedRelayPoint) {
      Alert.alert("Point relais", "Choisis un point relais avant de valider.");
      return;
    }

    try {
      setSavingDelivery(true);
      const nextCart = await api.updateRewardCartDelivery(token, {
        deliveryMode: "relay",
        relayPointName: selectedRelayPoint.name,
        relayAddress: selectedRelayPoint.address,
        relayOption: relayOptionDraft,
      });
      setCart(nextCart);
      setRelayModalVisible(false);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible d'enregistrer le point relais.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleCheckout = async () => {
    if (!token || !cart || cart.items.length === 0) return;

    try {
      setCheckoutLoading(true);
      const result = await api.checkoutRewardCart(token);
      Alert.alert(
        "Commande validee",
        `${result.purchasedCount} produit(s) achete(s) pour ${result.total}€`,
      );
      await loadCart();
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de finaliser la commande.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const toggleWalletDiscount = async () => {
    if (!token || !cart) return;

    try {
      setSubmittingWallet(true);
      const nextCart = await api.updateRewardCartWalletDiscount(
        token,
        !cart.useWalletDiscount,
      );
      setCart(nextCart);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de mettre a jour la cagnotte.");
    } finally {
      setSubmittingWallet(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Connectez-vous pour acceder au panier.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/login")}>
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </Pressable>
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
        <View style={styles.headerRow}>
          <Pressable style={styles.backCircle} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={brandColors.textDark} />
          </Pressable>
          <Text style={styles.title}>Panier</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!cart || cart.items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="bag-handle-outline" size={52} color={brandColors.textDark} style={{ opacity: 0.35 }} />
            <Text style={styles.emptyText}>Ton panier est vide.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/rewards")}>
              <Text style={styles.primaryButtonText}>Retour boutique</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {cart.items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  {item.reward.imageUrl ? (
                    <Image source={{ uri: item.reward.imageUrl }} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                      <Ionicons name="gift-outline" size={24} color={brandColors.textDark} style={{ opacity: 0.35 }} />
                    </View>
                  )}

                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.reward.title}</Text>
                    <Text style={styles.itemPrice}>{item.reward.cost}€</Text>
                    <View style={styles.qtyRow}>
                      <Pressable
                        style={[styles.qtyButton, styles.qtyMinus]}
                        onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItemId === item.id}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable
                        style={[styles.qtyButton, styles.qtyPlus]}
                        onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItemId === item.id}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
                {index < cart.items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}

            <View style={styles.summaryCard}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryText}>Total</Text>
                <Text style={styles.summaryText}>{cart.subtotal}€</Text>
              </View>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryText}>Livraison</Text>
                <Text style={styles.summaryText}>{cart.deliveryFee}€</Text>
              </View>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryText}>Reduction cagnotte</Text>
                <Text style={styles.summaryText}>-{cart.walletDiscount}€</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryLine}>
                <Text style={styles.summaryTotalLabel}>TOTAL</Text>
                <Text style={styles.summaryTotalValue}>{cart.total}€</Text>
              </View>
            </View>

            <Pressable
              style={styles.walletToggleRow}
              onPress={toggleWalletDiscount}
              disabled={submittingWallet}
            >
              <View style={[styles.walletCheckbox, cart.useWalletDiscount && styles.walletCheckboxChecked]}>
                {cart.useWalletDiscount && (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                )}
              </View>
              <Text style={styles.walletToggleText}>Utiliser ma cagnotte</Text>
              {submittingWallet && <ActivityIndicator size="small" color={brandColors.textDark} />}
            </Pressable>
            <Text style={styles.pointsInfo}>
              {cart.usedPoints} points utilises sur {cart.availablePoints} disponibles
            </Text>

            <Text style={styles.sectionTitle}>Livraison</Text>

            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHead}>
                <View style={styles.radioLabel}>
                  <View style={[styles.dot, cart.deliveryMode === "home" && styles.dotFilled]} />
                  <Ionicons name="home-outline" size={24} color={brandColors.textDark} />
                  <Text style={styles.deliveryTitle}>Domicile</Text>
                </View>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={openHomeModal}
                >
                  <Text style={styles.secondaryButtonText}>Adresse</Text>
                </Pressable>
              </View>
              <Text style={styles.addressLine}>{cart.homeRecipient || HOME_DEFAULT.homeRecipient}</Text>
              <Text style={styles.addressLine}>{cart.homeAddressLine1 || HOME_DEFAULT.homeAddressLine1}</Text>
              {!!cart.homeAddressLine2 && <Text style={styles.addressLine}>{cart.homeAddressLine2}</Text>}
              <Text style={styles.addressLine}>{`${cart.homePostalCode || HOME_DEFAULT.homePostalCode}, ${cart.homeCity || HOME_DEFAULT.homeCity}`}</Text>
            </View>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Ou</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHead}>
                <View style={styles.radioLabel}>
                  <View style={[styles.dot, cart.deliveryMode === "relay" && styles.dotFilled]} />
                  <Ionicons name="location-outline" size={24} color={brandColors.textDark} />
                  <Text style={styles.deliveryTitle}>Point Relais</Text>
                </View>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={openRelayModal}
                >
                  <Text style={styles.secondaryButtonText}>Choisir</Text>
                </Pressable>
              </View>

              <Text style={styles.addressLine}>{cart.relayPointName || "Aucun point relais selectionne"}</Text>
              <Text style={styles.addressLine}>{cart.relayAddress || "Selectionne un relais proche"}</Text>
              <Text style={styles.optionInfoText}>
                Option: {cart.relayOption === "priority" ? "Prioritaire (2 jours)" : "Standard (4/5 jours)"}
              </Text>
            </View>

            <Pressable
              style={[styles.checkoutButton, checkoutLoading && { opacity: 0.6 }]}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color={brandColors.textDark} />
              ) : (
                <Text style={styles.checkoutButtonText}>Valider la commande</Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal
        visible={homeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHomeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adresse domicile</Text>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <TextInput
                value={homeForm.homeRecipient}
                onChangeText={(value) => setHomeForm((prev) => ({ ...prev, homeRecipient: value }))}
                style={styles.input}
                placeholder="Destinataire"
                placeholderTextColor="#6B6661"
              />
              <TextInput
                value={homeForm.homeAddressLine1}
                onChangeText={(value) => setHomeForm((prev) => ({ ...prev, homeAddressLine1: value }))}
                style={styles.input}
                placeholder="Adresse ligne 1 *"
                placeholderTextColor="#6B6661"
              />
              <TextInput
                value={homeForm.homeAddressLine2}
                onChangeText={(value) => setHomeForm((prev) => ({ ...prev, homeAddressLine2: value }))}
                style={styles.input}
                placeholder="Adresse ligne 2"
                placeholderTextColor="#6B6661"
              />
              <TextInput
                value={homeForm.homePostalCode}
                onChangeText={(value) => setHomeForm((prev) => ({ ...prev, homePostalCode: value }))}
                style={styles.input}
                placeholder="Code postal *"
                placeholderTextColor="#6B6661"
                keyboardType="number-pad"
              />
              <TextInput
                value={homeForm.homeCity}
                onChangeText={(value) => setHomeForm((prev) => ({ ...prev, homeCity: value }))}
                style={styles.input}
                placeholder="Ville *"
                placeholderTextColor="#6B6661"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.secondaryButton, styles.modalActionButton]}
                onPress={() => setHomeModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, styles.modalActionButton, savingDelivery && { opacity: 0.6 }]}
                onPress={saveHomeDelivery}
                disabled={savingDelivery}
              >
                {savingDelivery ? (
                  <ActivityIndicator size="small" color={brandColors.textDark} />
                ) : (
                  <Text style={styles.primaryButtonText}>Enregistrer</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={relayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRelayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Point relais proche</Text>

            <Pressable
              style={[styles.secondaryButton, styles.modalLocateButton]}
              onPress={loadNearbyRelayPoints}
              disabled={loadingRelayPoints}
            >
              {loadingRelayPoints ? (
                <ActivityIndicator size="small" color={brandColors.textDark} />
              ) : (
                <Text style={styles.secondaryButtonText}>Actualiser autour de moi</Text>
              )}
            </Pressable>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {relayPoints.length === 0 ? (
                <Text style={styles.modalEmptyText}>Aucun point relais trouve.</Text>
              ) : (
                relayPoints.map((relayPoint) => {
                  const selected = relayPoint.id === selectedRelayPointId;
                  return (
                    <Pressable
                      key={relayPoint.id}
                      style={[styles.relayPointItem, selected && styles.relayPointItemSelected]}
                      onPress={() => setSelectedRelayPointId(relayPoint.id)}
                    >
                      <View style={[styles.dotSmall, selected && styles.dotSmallFilled]} />
                      <View style={styles.relayPointContent}>
                        <Text style={styles.relayPointName}>{relayPoint.name}</Text>
                        <Text style={styles.relayPointAddress}>{relayPoint.address}</Text>
                      </View>
                      <Text style={styles.relayDistance}>{relayPoint.distanceKm} km</Text>
                    </Pressable>
                  );
                })
              )}

              <Text style={styles.modalSubTitle}>Option de livraison</Text>

              <Pressable
                style={styles.optionRow}
                onPress={() => setRelayOptionDraft("standard")}
              >
                <View style={[styles.dotSmall, relayOptionDraft === "standard" && styles.dotSmallFilled]} />
                <Text style={styles.optionText}>0€ Standard - 4/5 jours ouvres</Text>
              </Pressable>
              <Pressable
                style={styles.optionRow}
                onPress={() => setRelayOptionDraft("priority")}
              >
                <View style={[styles.dotSmall, relayOptionDraft === "priority" && styles.dotSmallFilled]} />
                <Text style={styles.optionText}>6€ Prioritaire - 2 jours ouvres</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.secondaryButton, styles.modalActionButton]}
                onPress={() => setRelayModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, styles.modalActionButton, savingDelivery && { opacity: 0.6 }]}
                onPress={saveRelayDelivery}
                disabled={savingDelivery}
              >
                {savingDelivery ? (
                  <ActivityIndicator size="small" color={brandColors.textDark} />
                ) : (
                  <Text style={styles.primaryButtonText}>Valider</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#3B3433",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 46,
  },
  title: {
    fontSize: 44 / 2,
    fontWeight: "800",
    color: brandColors.textDark,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  itemImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 33 / 2,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyMinus: {
    backgroundColor: "#F4C64E",
  },
  qtyPlus: {
    backgroundColor: "#F7B9B4",
  },
  qtyButtonText: {
    fontSize: 22,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  qtyValue: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 22 / 1.5,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  separator: {
    height: 1,
    backgroundColor: "#BFB7B0",
  },
  summaryCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "#95BDD0",
    padding: 16,
    gap: 8,
  },
  summaryLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: {
    fontSize: 17,
    color: brandColors.textDark,
  },
  summaryDivider: {
    marginTop: 2,
    marginBottom: 2,
    height: 1,
    backgroundColor: "rgba(61,54,50,0.3)",
  },
  summaryTotalLabel: {
    fontSize: 38 / 2,
    fontWeight: "900",
    color: brandColors.textDark,
  },
  summaryTotalValue: {
    fontSize: 48 / 2,
    fontWeight: "900",
    color: brandColors.textDark,
  },
  pointsInfo: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    color: brandColors.textDark,
    opacity: 0.8,
  },
  walletToggleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  walletCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3B3433",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  walletCheckboxChecked: {
    backgroundColor: "#3F94BB",
    borderColor: "#3F94BB",
  },
  walletToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: brandColors.textDark,
    flex: 1,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 40 / 2,
    fontWeight: "800",
    color: brandColors.textDark,
  },
  deliveryCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  deliveryHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radioLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#F26A13",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#F26A13",
  },
  deliveryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  addressLine: {
    color: brandColors.textDark,
    opacity: 0.9,
    fontSize: 16 / 1.15,
    marginBottom: 2,
    marginLeft: 21,
  },
  optionInfoText: {
    color: brandColors.textDark,
    opacity: 0.9,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 21,
  },
  orRow: {
    marginVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#BFB7B0",
  },
  orText: {
    fontSize: 28 / 2,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  dotSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#F26A13",
  },
  dotSmallFilled: {
    backgroundColor: "#F26A13",
  },
  optionText: {
    color: brandColors.textDark,
    fontSize: 22 / 2,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F4C64E",
  },
  primaryButtonText: {
    color: brandColors.textDark,
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#F4C64E",
  },
  secondaryButtonText: {
    color: brandColors.textDark,
    fontWeight: "700",
    fontSize: 14,
  },
  checkoutButton: {
    marginTop: 24,
    backgroundColor: "#F4C64E",
    borderRadius: 22,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: brandColors.textDark,
    fontWeight: "800",
    fontSize: 16,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.75,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 22, 20, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: "#FFF8EF",
    maxHeight: "82%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: brandColors.textDark,
    marginBottom: 12,
  },
  modalSubTitle: {
    marginTop: 14,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  modalBody: {
    maxHeight: 360,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  modalActionButton: {
    minWidth: 108,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLocateButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D3C8BB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: brandColors.textDark,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  modalEmptyText: {
    color: brandColors.textDark,
    opacity: 0.75,
    marginBottom: 8,
  },
  relayPointItem: {
    borderWidth: 1,
    borderColor: "#D3C8BB",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  relayPointItemSelected: {
    borderColor: "#F26A13",
    backgroundColor: "#FFF3E3",
  },
  relayPointContent: {
    flex: 1,
  },
  relayPointName: {
    color: brandColors.textDark,
    fontWeight: "700",
    fontSize: 13,
  },
  relayPointAddress: {
    color: brandColors.textDark,
    opacity: 0.8,
    fontSize: 12,
    marginTop: 2,
  },
  relayDistance: {
    color: brandColors.textDark,
    fontWeight: "700",
    fontSize: 12,
  },
});
