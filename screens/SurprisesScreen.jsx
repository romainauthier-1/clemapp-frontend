import {
	View,
	ScrollView,
	Text,
	Pressable,
	StyleSheet,
	TextInput,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	Touchable,
	ActivityIndicator,
	Animated,
	RefreshControl,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	setSurprises,
	unlockSurprise,
	setSelectedSurprise,
} from "../reducers/surprises";
import { setUserList } from "../reducers/user";
import { useIsFocused } from "@react-navigation/native";
import { Lock, LockOpen, BadgeQuestionMark } from "lucide-react-native";
import { showMessage, hideMessage } from "react-native-flash-message";
import { colors } from "./colors";
import SurpriseCard from "../components/SurpriseCard";
import { SafeAreaView } from "react-native-safe-area-context";

const screenHeight = Dimensions.get("window").height;

export default function SurprisesScreen({ navigation }) {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const isFocused = useIsFocused();
	const isDemo = useSelector(
		(state) =>
			state.user.status === "demo" ||
			state.user.status === "demo-admin" ||
			state.user.status === "demo-star",
	);
	const guestsList = useSelector((state) => state.user.userList);
	const surprises = useSelector((state) => state.surprises.surprises);
	const selectedSurpriseId = useSelector(
		(state) => state.surprises.selectedSurprise?._id,
	);
	const selectedSurprise = useSelector((state) =>
		state.surprises.surprises.find(
			(surprise) => surprise._id === selectedSurpriseId,
		),
	);
	const [refreshing, setRefreshing] = useState(false);

	const getSurprises = async (isDemo) => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/all/${isDemo}`,
			);
			const data = await response.json();

			if (data.result) {
				dispatch(setSurprises(data.allSurprises));
			} else {
				dispatch(setSurprises([]));
			}
		} catch (err) {
			console.error(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const getAllUsers = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/all`,
			);
			const data = await response.json();
			dispatch(setUserList(data.allUsers));
			return data;
		} catch (err) {
			console.error(err);
			showMessage({
				message: "Problème de connexion BDD",
				type: "warning",
				style: {
					borderRadius: 10,
					marginBottom: 15,
				},
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onRefresh = async () => {
		console.log("------ Début du refresh ------");
		setRefreshing(true);

		try {
			await getSurprises(isDemo);
			dispatch(setSelectedSurprise(null));
		} catch (err) {
			console.error(err);
		} finally {
			setRefreshing(false);
		}
	};

	useEffect(() => {
		isFocused && getSurprises(isDemo);
		dispatch(setSelectedSurprise(null));

		if (guestsList.length === 0) {
			getAllUsers();
		}
	}, [isFocused]);

	const unlockTimeSurprise = async (surpriseId) => {
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/unlock/${surpriseId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
				},
			);
			const data = await response.json();

			if (data.result) {
				sendNotification(
					"🎁 Surprise débloquée !",
					data.unlockedSurprise.title,
				);
				dispatch(unlockSurprise(surpriseId));
				showMessage({
					message: data.message || "Surprise débloquée !",
					type: "success",
					backgroundColor: colors.background,
					color: colors.white,
					style: {
						borderRadius: 10,
						width: screenWidth,
					},
				});
				setAnswerInput(null);
			}
		} catch (err) {
			console.error(err.message);
		}
	};

	useEffect(() => {
		if (!surprises || surprises.length === 0) return;

		const timers = surprises
			.filter(
				(surprise) => surprise.revealMode === "time" && !surprise.isUnlocked,
			)
			.map((surprise) => {
				const now = new Date().getTime();
				const timeUntilReveal = new Date(surprise.revealAt).getTime() - now;

				if (timeUntilReveal < 0) {
					unlockTimeSurprise(surprise._id);
				} else {
					return setTimeout(() => {
						unlockTimeSurprise(surprise._id);
					}, timeUntilReveal);
				}
			});

		return () => timers.forEach((timer) => timer && clearTimeout(timer));
	}, [isFocused]);

	const fullTokenList = guestsList?.map((user) => user.token);

	const sendNotification = async (title, body) => {
		console.log("TokenList :", fullTokenList);
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tokenList: fullTokenList,
						title: title,
						body: body,
						url: "/",
					}),
				},
			);
			await response.json();
		} catch (err) {
			console.error(err);
			showMessage({
				message: "Problème de connexion BDD",
				type: "error",
				style: {
					borderRadius: 10,
					marginBottom: 15,
				},
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRiddleAnswer = async (surpriseId, answer) => {
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/answer/${surpriseId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ answer }),
				},
			);
			const data = await response.json();

			if (data.result) {
				sendNotification(
					"🎁 Surprise débloquée !",
					data.unlockedSurprise.title,
				);
				dispatch(unlockSurprise(surpriseId));
				showMessage({
					message: data.message || "Bravo, bonne réponse !",
					type: "success",
					backgroundColor: colors.primary,
					color: colors.white,
					style: {
						borderRadius: 10,
						marginBottom: 15,
					},
				});
			} else {
				showMessage({
					message: data.message || "Eh non, mauvaise réponse !",
					type: "warning",
					style: {
						borderRadius: 10,
						marginBottom: 15,
					},
				});
			}
		} catch (err) {
			console.error(err.message);
		}
	};

	const surpriseMiniCards = surprises
		?.slice()
		.sort(
			(a, b) => new Date(a.revealAt).getTime() - new Date(b.revealAt).getTime(),
		)
		.map((surprise, index) => {
			return (
				<Pressable
					style={
						surprise.isUnlocked ? styles.unlockedMiniCards : styles.miniCards
					}
					key={surprise._id}
					surprise={surprise}
					onPress={() => dispatch(setSelectedSurprise(surprise))}
				>
					{surprise.revealMode === "riddle" && !surprise.isUnlocked && (
						<View style={styles.badge}>
							<BadgeQuestionMark size={22} color={colors.white} />
						</View>
					)}
					<Text style={styles.miniCardsText}>{index + 1}</Text>
					<View style={styles.iconContainer}>
						{surprise.isUnlocked ? (
							<LockOpen size={20} color={colors.white} />
						) : (
							<Lock size={20} color={colors.white} />
						)}
					</View>
				</Pressable>
			);
		});

	const unlockedSurprisesCount = surprises?.filter(
		(surprise) => surprise.isUnlocked,
	).length;

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(100)).current;

	useEffect(() => {
		if (selectedSurprise) {
			fadeAnim.setValue(0);
			translateY.setValue(100);

			Animated.parallel([
				Animated.spring(fadeAnim, {
					toValue: 1,
					friction: 5,
					tension: 40,
					useNativeDriver: true,
				}),
				Animated.timing(translateY, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [selectedSurprise]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container} pointerEvents="box-none">
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					bounces={true}
					alwaysBounceVertical={true}
					overScrollMode="always"
				>
					{isLoading ? (
						<ActivityIndicator size="large" color={colors.primary} />
					) : (
						<>
							<Text style={styles.title}>
								{unlockedSurprisesCount} / {surprises.length} surprises
								débloquées !
							</Text>

							{selectedSurprise ? (
								<Animated.View
									style={{
										justifyContent: "center",
										alignItems: "center",
										opacity: fadeAnim,
										transform: [{ translateY }],
									}}
								>
									<SurpriseCard
										key={selectedSurprise._id}
										surprise={selectedSurprise}
										handleRiddleAnswer={handleRiddleAnswer}
										sendNotification={sendNotification}
									/>
									<Pressable
										style={styles.backBtn}
										onPress={() => dispatch(setSelectedSurprise(null))}
									>
										<Text style={styles.backBtnText}>← Retour</Text>
									</Pressable>
								</Animated.View>
							) : (
								<View style={styles.miniCardsContainer}>
									{surprises.length > 0 ? (
										surpriseMiniCards
									) : (
										<Text>Aucune surprise pour l'instant !</Text>
									)}
								</View>
							)}
						</>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		display: "flex",
		flex: 1,
		backgroundColor: colors.backgroundLight,
	},
	scrollContent: {
		flexGrow: 1,
		alignItems: "center",
		paddingBottom: 40,
		minHeight: screenHeight * 1.05,
	},
	scrollView: {
		zIndex: 10,
		flex: 1,
		width: "100%",
	},
	title: {
		color: colors.white,
		textAlign: "center",
		fontSize: 24,
		marginTop: 32,
		fontWeight: "700",
		letterSpacing: 0.4,
		paddingHorizontal: 20,
	},
	miniCardsContainer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "space-evenly",
		width: "100%",
		marginTop: 20,
		paddingHorizontal: 8,
	},
	miniCards: {
		borderWidth: 0,
		borderRadius: 14,
		padding: 12,
		width: "18%",
		aspectRatio: 1,
		backgroundColor: colors.primary,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 4,
		borderBottomWidth: 2,
		borderBottomColor: colors.secondaryLight,
	},
	unlockedMiniCards: {
		borderWidth: 0,
		borderRadius: 14,
		padding: 12,
		width: "18%",
		aspectRatio: 1,
		backgroundColor: colors.secondaryLight,
		opacity: 0.8,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.secondaryLight,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
		borderBottomWidth: 2,
		borderBottomColor: colors.primary,
	},
	miniCardsText: {
		textAlign: "center",
		color: colors.white,
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.2,
	},
	iconContainer: {
		alignItems: "center",
		marginTop: 6,
	},
	backBtn: {
		marginTop: 24,
		marginBottom: 20,
		paddingVertical: 12,
		paddingHorizontal: 24,
		backgroundColor: colors.primary,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 4,
		borderBottomWidth: 2,
		borderBottomColor: colors.secondaryLight,
	},
	backBtnText: {
		color: colors.white,
		fontWeight: "700",
		fontSize: 16,
		letterSpacing: 0.3,
	},
	badge: {
		backgroundColor: colors.secondaryLight,
		borderRadius: 12,
		position: "absolute",
		top: -8,
		right: -8,
		padding: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
});
