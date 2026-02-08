import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { brandColors } from "@/constants/Colors";
import { api, Trail, CulturalPlaceType, TrailProgress } from "@/services/api";
import { storage } from "@/services/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TYPE_CONFIG: Record<CulturalPlaceType, { label: string; color: string }> =
  {
    art: { label: "ART", color: "#E07B39" },
    patrimoine: { label: "PATRIMOINE", color: "#3F94BB" },
    mythe: { label: "MYTHE", color: "#4CAF50" },
    musique: { label: "MUSIQUE", color: "#9C27B0" },
  };

export default function TrailsScreen() {
  const router = useRouter();
  const { placeName } = useLocalSearchParams<{
    placeId?: string;
    placeName?: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedTrail, setScannedTrail] = useState<Trail | null>(null);
  const [loadingTrail, setLoadingTrail] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [trailStatus, setTrailStatus] = useState<TrailProgress | null>(null);
  const [loadingTrailStatus, setLoadingTrailStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      return () => setCameraActive(false);
    }, []),
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoadingTrail(true);
    setScanError(false);

    try {
      // Le QR code contient un JSON : { trail: { id, ... }, culturalPlace: {...} }
      const parsed = JSON.parse(data);
      const trailId = parsed.trail?.id;
      if (trailId) {
        const trail = await api.getTrailById(trailId);
        setScannedTrail(trail);

        setLoadingTrailStatus(true);
        try {
          const token = await storage.getToken();
          if (token) {
            const status = await api.getTrailStatus(token, trailId);
            setTrailStatus(status);
          } else {
            setTrailStatus(null);
          }
        } catch {
          setTrailStatus(null);
        } finally {
          setLoadingTrailStatus(false);
        }
      } else {
        setScanError(true);
      }
    } catch {
      setScanError(true);
    } finally {
      setLoadingTrail(false);
    }
  };

  const handleCloseModal = () => {
    setScanned(false);
    setScannedTrail(null);
    setScanError(false);
    setTrailStatus(null);
    setLoadingTrailStatus(false);
  };

  const handleStartEnigma = () => {
    if (!scannedTrail) return;
    handleCloseModal();
    router.push({
      pathname: "/enigma",
      params: { trailId: scannedTrail.id },
    });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brandColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.permissionContainer}>
          <Ionicons
            name="camera-outline"
            size={64}
            color={brandColors.textDark}
          />
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            L'accès à la caméra est nécessaire pour scanner les QR codes des
            lieux culturels.
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const place = scannedTrail?.culturalPlace;
  const typeConfig = place ? TYPE_CONFIG[place.type] : null;
  const trailCompleted = Boolean(trailStatus?.completed);
  const hasMissingPoints = (trailStatus?.missingPoints ?? 0) > 0;
  const statusMessage = trailCompleted
    ? hasMissingPoints
      ? "Ce parcours a déjà été fait, mais il vous reste des points à récupérer"
      : "Vous pouvez refaire ce parcours mais vous ne gagnerez pas de point"
    : null;

  return (
    <View style={styles.container}>
      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}

      {/* Overlay avec zone de scan */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <SafeAreaView
          style={styles.overlay}
          edges={["top"]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scanner le QR Code</Text>
            {placeName && (
              <Text style={styles.headerSubtitle}>{placeName}</Text>
            )}
          </View>

          <View style={styles.scanAreaContainer} pointerEvents="none">
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.scanHint}>Placez le QR code dans le cadre</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Modal résultat du scan */}
      {scanned && (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            {loadingTrail ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={brandColors.primary} />
                <Text style={styles.modalLoadingText}>
                  Chargement du parcours...
                </Text>
              </View>
            ) : scannedTrail && place ? (
              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Nom du lieu */}
                <Text style={styles.modalPlaceName}>{place.name}</Text>

                {/* Badge type + localisation */}
                <View style={styles.modalMetaRow}>
                  {typeConfig && (
                    <View
                      style={[
                        styles.typeBadge,
                        { borderColor: typeConfig.color },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: typeConfig.color },
                        ]}
                      >
                        {typeConfig.label}
                      </Text>
                    </View>
                  )}
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={brandColors.accentOrange}
                    />
                    <Text style={styles.locationText}>
                      {place.postCode} - {place.city}
                    </Text>
                  </View>
                </View>

                {/* Infos du parcours */}
                <View style={styles.trailInfoCard}>
                  <Text style={styles.trailName}>{scannedTrail.name}</Text>
                  {scannedTrail.description && (
                    <Text style={styles.trailDescription}>
                      {scannedTrail.description}
                    </Text>
                  )}
                  <View style={styles.trailStats}>
                    {scannedTrail.durationMinute > 0 && (
                      <View style={styles.trailStat}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={brandColors.textDark}
                        />
                        <Text style={styles.trailStatText}>
                          {scannedTrail.durationMinute} min
                        </Text>
                      </View>
                    )}
                    {scannedTrail.difficulty && (
                      <View style={styles.trailStat}>
                        <Ionicons
                          name="fitness-outline"
                          size={18}
                          color={brandColors.textDark}
                        />
                        <Text style={styles.trailStatText}>
                          {scannedTrail.difficulty}
                        </Text>
                      </View>
                    )}
                    {scannedTrail.questions && (
                      <View style={styles.trailStat}>
                        <Ionicons
                          name="help-circle-outline"
                          size={18}
                          color={brandColors.textDark}
                        />
                        <Text style={styles.trailStatText}>
                          {scannedTrail.questions.length} question
                          {scannedTrail.questions.length > 1 ? "s" : ""}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {loadingTrailStatus && (
                  <View style={styles.trailStatusCard}>
                    <Text style={styles.trailStatusText}>
                      Chargement du statut du parcours...
                    </Text>
                  </View>
                )}

                {!loadingTrailStatus && statusMessage && (
                  <View style={styles.trailStatusCard}>
                    <Text style={styles.trailStatusText}>{statusMessage}</Text>
                    {hasMissingPoints && (
                      <Text style={styles.trailStatusSubtext}>
                        Points manquants : {trailStatus?.missingPoints}
                      </Text>
                    )}
                  </View>
                )}

                {/* Bouton commencer */}
                <Pressable
                  style={styles.startButton}
                  onPress={handleStartEnigma}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.startButtonText}>Commencer l'énigme</Text>
                </Pressable>

                {/* Bouton rescanner */}
                <Pressable
                  style={styles.rescanButton}
                  onPress={handleCloseModal}
                >
                  <Ionicons
                    name="scan-outline"
                    size={20}
                    color={brandColors.textDark}
                  />
                  <Text style={styles.rescanButtonText}>
                    Scanner un autre QR code
                  </Text>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.modalError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#E07B39"
                />
                <Text style={styles.modalErrorTitle}>QR code non reconnu</Text>
                <Text style={styles.modalErrorText}>
                  Ce QR code ne correspond à aucun parcours.
                </Text>
                <Pressable
                  style={styles.rescanButton}
                  onPress={handleCloseModal}
                >
                  <Ionicons
                    name="scan-outline"
                    size={20}
                    color={brandColors.textDark}
                  />
                  <Text style={styles.rescanButtonText}>Réessayer</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const SCAN_SIZE = SCREEN_WIDTH * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: brandColors.backgroundLight,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: brandColors.textDark,
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: brandColors.textDark,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "white",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: brandColors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "65%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CCC",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalLoading: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: brandColors.textDark,
  },
  modalPlaceName: {
    fontSize: 24,
    fontWeight: "800",
    color: brandColors.textDark,
    marginBottom: 10,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  // Trail info card
  trailInfoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  trailName: {
    fontSize: 18,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 6,
  },
  trailDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: brandColors.textDark,
    opacity: 0.8,
    marginBottom: 12,
  },
  trailStats: {
    flexDirection: "row",
    gap: 16,
  },
  trailStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trailStatText: {
    fontSize: 13,
    color: brandColors.textDark,
    fontWeight: "500",
  },
  trailStatusCard: {
    backgroundColor: "#FFF6E9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F4D6B8",
    marginBottom: 16,
  },
  trailStatusText: {
    fontSize: 14,
    color: brandColors.textDark,
    fontWeight: "600",
  },
  trailStatusSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: brandColors.textDark,
    opacity: 0.8,
  },
  // Buttons
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brandColors.accentOrange,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    gap: 8,
  },
  rescanButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: brandColors.textDark,
  },
  modalError: {
    alignItems: "center",
    paddingVertical: 20,
  },
  modalErrorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  modalErrorText: {
    fontSize: 15,
    color: brandColors.textDark,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
  },
});
