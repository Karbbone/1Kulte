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
import { useFocusEffect, useRouter } from "expo-router";
import {
  api,
  RewardCart,
  RewardDeliveryMode,
  RewardRelayOption,
} from "@/services/api";
import { storage } from "@/services/storage";
import { brandColors } from "@/constants/Colors";

const HOME_DEFAULT = {
  homeRecipient: "My Digital School",
  homeAddressLine1: "3 Rue Marie Curie",
  homePostalCode: "56000",
  homeCity: "Plescop",
};

const RELAY_DEFAULT = {
  relayPointName: "Point Relais Kulte",
  relayAddress: "12 Rue du Centre, 56000 Vannes",
};

export default function CartScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<RewardCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, []),
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

  const updateDeliveryMode = async (
    deliveryMode: RewardDeliveryMode,
    relayOption: RewardRelayOption = "standard",
  ) => {
    if (!token) return;

    try {
      setSubmittingDelivery(true);

      const payload =
        deliveryMode === "home"
          ? {
              deliveryMode,
              homeRecipient: cart?.homeRecipient || HOME_DEFAULT.homeRecipient,
              homeAddressLine1: cart?.homeAddressLine1 || HOME_DEFAULT.homeAddressLine1,
              homePostalCode: cart?.homePostalCode || HOME_DEFAULT.homePostalCode,
              homeCity: cart?.homeCity || HOME_DEFAULT.homeCity,
            }
          : {
              deliveryMode,
              relayPointName: cart?.relayPointName || RELAY_DEFAULT.relayPointName,
              relayAddress: cart?.relayAddress || RELAY_DEFAULT.relayAddress,
              relayOption,
            };

      const nextCart = await api.updateRewardCartDelivery(token, payload);
      setCart(nextCart);
    } catch (error: any) {
      Alert.alert("Erreur", error?.message || "Impossible de modifier la livraison.");
    } finally {
      setSubmittingDelivery(false);
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
              <View style={styles.summaryDivider} />
              <View style={styles.summaryLine}>
                <Text style={styles.summaryTotalLabel}>TOTAL</Text>
                <Text style={styles.summaryTotalValue}>{cart.total}€</Text>
              </View>
            </View>

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
                  onPress={() => updateDeliveryMode("home")}
                  disabled={submittingDelivery}
                >
                  <Text style={styles.secondaryButtonText}>Modifier</Text>
                </Pressable>
              </View>
              <Text style={styles.addressLine}>{cart.homeRecipient || HOME_DEFAULT.homeRecipient}</Text>
              <Text style={styles.addressLine}>{cart.homeAddressLine1 || HOME_DEFAULT.homeAddressLine1}</Text>
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
                  onPress={() => updateDeliveryMode("relay", cart.relayOption)}
                  disabled={submittingDelivery}
                >
                  <Text style={styles.secondaryButtonText}>Choisir</Text>
                </Pressable>
              </View>

              <Text style={styles.addressLine}>{cart.relayPointName || RELAY_DEFAULT.relayPointName}</Text>
              <Text style={styles.addressLine}>{cart.relayAddress || RELAY_DEFAULT.relayAddress}</Text>

              <View style={styles.relayOptions}>
                <Pressable
                  style={styles.optionRow}
                  onPress={() => updateDeliveryMode("relay", "standard")}
                >
                  <View style={[styles.dotSmall, cart.relayOption === "standard" && styles.dotSmallFilled]} />
                  <Text style={styles.optionText}>0€ Standard - 4/5 jours ouvres</Text>
                </Pressable>
                <Pressable
                  style={styles.optionRow}
                  onPress={() => updateDeliveryMode("relay", "priority")}
                >
                  <View style={[styles.dotSmall, cart.relayOption === "priority" && styles.dotSmallFilled]} />
                  <Text style={styles.optionText}>6€ Prioritaire - 2 jours ouvres</Text>
                </Pressable>
              </View>
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
  relayOptions: {
    marginTop: 8,
    marginLeft: 21,
    gap: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});
