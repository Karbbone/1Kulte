import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { brandColors } from "@/constants/Colors";
import { storage } from "@/services/storage";
import {
  api,
  Trail,
  QcmQuestion,
  CulturalPlaceType,
} from "@/services/api";

const TYPE_CONFIG: Record<CulturalPlaceType, { label: string; color: string }> = {
  art: { label: "ART", color: "#E07B39" },
  patrimoine: { label: "PATRIMOINE", color: "#3F94BB" },
  mythe: { label: "MYTHE", color: "#4CAF50" },
  musique: { label: "MUSIQUE", color: "#9C27B0" },
};

type Screen = "intro" | "question" | "result";

export default function EnigmaScreen() {
  const router = useRouter();
  const { trailId } = useLocalSearchParams<{ trailId: string }>();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Question state
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadTrail();
    }, [trailId])
  );

  const loadTrail = async () => {
    if (!trailId) return;
    setLoading(true);
    try {
      const [trailData, userToken] = await Promise.all([
        api.getTrailById(trailId),
        storage.getToken(),
      ]);
      // Charger les questions avec imageUrl via l'endpoint QCM dédié
      const questionsWithUrls = await api.getQcmQuestions(trailId);
      trailData.questions = questionsWithUrls;
      setTrail(trailData);
      setToken(userToken);
    } catch (error) {
      console.error("Error loading trail:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion: QcmQuestion | null =
    trail?.questions?.[currentIndex] ?? null;

  const handleStartQuiz = () => {
    setScreen("question");
    setCurrentIndex(0);
    setScore(0);
    setTotalPoints(0);
    setSelectedAnswerId(null);
    setAnswerCorrect(null);
  };

  const handleSelectAnswer = async (answerId: string) => {
    if (submitting || answerCorrect !== null) return;
    setSelectedAnswerId(answerId);
    setSubmitting(true);

    try {
      if (token && currentQuestion) {
        const result = await api.submitQcmAnswer(token, currentQuestion.id, answerId);
        setAnswerCorrect(result.isCorrect);
        setTotalPoints((prev) => prev + result.pointsEarned);
        if (result.isCorrect) {
          setScore((prev) => prev + 1);
        }
      } else {
        // Fallback sans token : vérifier localement
        const selected = currentQuestion?.answers.find((a) => a.id === answerId);
        const correct = selected?.isCorrect ?? false;
        setAnswerCorrect(correct);
        if (correct) {
          setScore((prev) => prev + 1);
          setTotalPoints((prev) => prev + (currentQuestion?.point ?? 0));
        }
      }
    } catch {
      // En cas d'erreur (ex: déjà répondu), vérifier localement
      const selected = currentQuestion?.answers.find((a) => a.id === answerId);
      const correct = selected?.isCorrect ?? false;
      setAnswerCorrect(correct);
      if (correct) {
        setScore((prev) => prev + 1);
        setTotalPoints((prev) => prev + (currentQuestion?.point ?? 0));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!trail?.questions) return;
    if (currentIndex < trail.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setAnswerCorrect(null);
    } else {
      setScreen("result");
    }
  };

  const handleFinish = () => {
    router.back();
  };

  if (loading || !trail) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={brandColors.textDark} />
          </Pressable>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={styles.loadingText}>Chargement du parcours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const place = trail.culturalPlace;
  const typeConfig = place ? TYPE_CONFIG[place.type] : null;
  const questions = trail.questions || [];

  // --- INTRO SCREEN ---
  if (screen === "intro") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.introHeader}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={brandColors.textDark} />
            </Pressable>
          </View>

          {/* Lieu culturel */}
          <View style={styles.introPlaceSection}>
            {typeConfig && (
              <View style={[styles.typeBadge, { borderColor: typeConfig.color }]}>
                <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
                  {typeConfig.label}
                </Text>
              </View>
            )}
            <Text style={styles.introPlaceName}>{place.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={brandColors.accentOrange} />
              <Text style={styles.locationText}>
                {place.postCode} - {place.city}
              </Text>
            </View>
          </View>

          {/* Parcours info */}
          <View style={styles.introTrailCard}>
            <Text style={styles.introTrailName}>{trail.name}</Text>
            {trail.description && (
              <Text style={styles.introTrailDescription}>{trail.description}</Text>
            )}

            <View style={styles.introStatsRow}>
              {trail.durationMinute > 0 && (
                <View style={styles.introStat}>
                  <Ionicons name="time-outline" size={24} color={brandColors.accentOrange} />
                  <Text style={styles.introStatValue}>{trail.durationMinute} min</Text>
                  <Text style={styles.introStatLabel}>Durée</Text>
                </View>
              )}
              {trail.difficulty && (
                <View style={styles.introStat}>
                  <Ionicons name="fitness-outline" size={24} color={brandColors.accentOrange} />
                  <Text style={styles.introStatValue}>{trail.difficulty}</Text>
                  <Text style={styles.introStatLabel}>Difficulté</Text>
                </View>
              )}
              <View style={styles.introStat}>
                <Ionicons name="help-circle-outline" size={24} color={brandColors.accentOrange} />
                <Text style={styles.introStatValue}>{questions.length}</Text>
                <Text style={styles.introStatLabel}>Question{questions.length > 1 ? "s" : ""}</Text>
              </View>
            </View>
          </View>

          {/* Bouton commencer */}
          <Pressable
            style={[styles.primaryButton, questions.length === 0 && styles.primaryButtonDisabled]}
            onPress={handleStartQuiz}
            disabled={questions.length === 0}
          >
            <Ionicons name="play" size={22} color="white" />
            <Text style={styles.primaryButtonText}>
              {questions.length === 0 ? "Aucune question disponible" : "Commencer le quiz"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- QUESTION SCREEN ---
  if (screen === "question" && currentQuestion) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.questionContainer}>
          {/* Progress bar */}
          <View style={styles.progressHeader}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={brandColors.textDark} />
            </Pressable>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Image de la question */}
            {currentQuestion.imageUrl && (
              <Image
                source={{ uri: currentQuestion.imageUrl }}
                style={styles.questionImage}
                resizeMode="cover"
              />
            )}

            {/* Texte de la question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Réponses */}
            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer) => {
                const isSelected = selectedAnswerId === answer.id;
                const showResult = answerCorrect !== null;
                const isCorrectAnswer = answer.isCorrect;

                let answerStyle = styles.answerDefault;
                if (showResult && isCorrectAnswer) {
                  answerStyle = styles.answerCorrect;
                } else if (showResult && isSelected && !answerCorrect) {
                  answerStyle = styles.answerWrong;
                } else if (isSelected) {
                  answerStyle = styles.answerSelected;
                }

                return (
                  <Pressable
                    key={answer.id}
                    style={[styles.answerButton, answerStyle]}
                    onPress={() => handleSelectAnswer(answer.id)}
                    disabled={answerCorrect !== null || submitting}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        showResult && isCorrectAnswer && styles.answerTextCorrect,
                        showResult && isSelected && !answerCorrect && styles.answerTextWrong,
                      ]}
                    >
                      {answer.answer}
                    </Text>
                    {showResult && isCorrectAnswer && (
                      <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                    )}
                    {showResult && isSelected && !answerCorrect && (
                      <Ionicons name="close-circle" size={22} color="#E53935" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Feedback + bouton suivant */}
            {answerCorrect !== null && (
              <View style={styles.feedbackContainer}>
                <Text style={[styles.feedbackText, answerCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                  {answerCorrect ? "Bonne réponse !" : "Mauvaise réponse"}
                </Text>
                <Pressable style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    {currentIndex < questions.length - 1 ? "Question suivante" : "Voir les résultats"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </Pressable>
              </View>
            )}

            {submitting && (
              <ActivityIndicator size="small" color={brandColors.primary} style={{ marginTop: 20 }} />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // --- RESULT SCREEN ---
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.resultContent}>
          <Ionicons
            name={score === questions.length ? "trophy" : "ribbon"}
            size={80}
            color={brandColors.primary}
          />
          <Text style={styles.resultTitle}>Quiz terminé !</Text>
          <Text style={styles.resultScore}>
            {score} / {questions.length}
          </Text>
          <Text style={styles.resultLabel}>bonnes réponses</Text>

          {totalPoints > 0 && (
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={20} color={brandColors.primary} />
              <Text style={styles.pointsText}>+{totalPoints} points gagnés</Text>
            </View>
          )}

          <Text style={styles.resultTrailName}>{trail.name}</Text>
          <Text style={styles.resultPlaceName}>{place.name}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleFinish}>
          <Text style={styles.primaryButtonText}>Terminer</Text>
        </Pressable>
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: brandColors.textDark,
    marginTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  // INTRO
  introScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  introHeader: {
    marginBottom: 24,
  },
  introPlaceSection: {
    marginBottom: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 2,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  introPlaceName: {
    fontSize: 28,
    fontWeight: "800",
    color: brandColors.textDark,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    color: brandColors.textDark,
    opacity: 0.7,
  },
  introTrailCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  introTrailName: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.textDark,
    marginBottom: 8,
  },
  introTrailDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: brandColors.textDark,
    opacity: 0.8,
    marginBottom: 16,
  },
  introStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0ECE4",
  },
  introStat: {
    alignItems: "center",
    gap: 4,
  },
  introStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: brandColors.textDark,
  },
  introStatLabel: {
    fontSize: 12,
    color: "#999",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brandColors.accentOrange,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: "#CCC",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
  },
  // QUESTION
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.textDark,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E8E4DC",
    borderRadius: 3,
    marginBottom: 20,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: brandColors.accentOrange,
    borderRadius: 3,
  },
  questionScroll: {
    paddingBottom: 40,
  },
  questionImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.textDark,
    lineHeight: 28,
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  answerDefault: {
    borderColor: "#E8E4DC",
    backgroundColor: "white",
  },
  answerSelected: {
    borderColor: brandColors.accentOrange,
    backgroundColor: "#FFF8F0",
  },
  answerCorrect: {
    borderColor: "#4CAF50",
    backgroundColor: "#F0FFF0",
  },
  answerWrong: {
    borderColor: "#E53935",
    backgroundColor: "#FFF0F0",
  },
  answerText: {
    fontSize: 16,
    color: brandColors.textDark,
    flex: 1,
    marginRight: 8,
  },
  answerTextCorrect: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  answerTextWrong: {
    color: "#C62828",
    fontWeight: "600",
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  feedbackCorrect: {
    color: "#4CAF50",
  },
  feedbackWrong: {
    color: "#E53935",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brandColors.textDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // RESULT
  resultScroll: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  resultContent: {
    alignItems: "center",
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: brandColors.textDark,
    marginTop: 20,
    marginBottom: 12,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "800",
    color: brandColors.accentOrange,
  },
  resultLabel: {
    fontSize: 16,
    color: brandColors.textDark,
    opacity: 0.7,
    marginBottom: 20,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: "600",
    color: brandColors.textDark,
  },
  resultTrailName: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.textDark,
    marginBottom: 4,
  },
  resultPlaceName: {
    fontSize: 14,
    color: "#999",
  },
});
