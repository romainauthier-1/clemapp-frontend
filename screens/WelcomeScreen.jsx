import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Touchable,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSurprises, unlockSurprise } from "../reducers/surprises";
import { colors } from "./colors";
import { Sunrise, Sunset } from "lucide-react-native";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const user = useSelector((state) => state.user);
  const [quote, setQuote] = useState(null);
  const [weatherInfos, setWeatherInfos] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);

  const getRandomCitation = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/random-quote`,
      );
      const data = await response.json();
      data.result && setQuote(data.quote);
    } catch (err) {
      console.error(err.message);
    }
  };

  const getWeather = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/weather`,
      );
      const data = await response.json();

      if (data.result) {
        setWeatherInfos(data.generalInfos);
        setWeatherForecast(data.forecast);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const weatherForecastToDisplay = weatherForecast?.map((item, index) => {
    const weatherIcon = `https://openweathermap.org/img/wn/${item.icon}@2x.png`;
    return (
      <View key={index} style={styles.weatherForecastItem}>
        <Text style={styles.weatherForecastTime}>{item.time}</Text>
        <Text style={styles.weatherForecastTemp}>{item.temp}°C</Text>
        <Image
          style={styles.weatherForecastIcon}
          source={{ uri: weatherIcon }}
          resizeMode="contain"
        />
      </View>
    );
  });

  const [isLinusUnlocked, setIsLinusUnlocked] = useState(false);
  const currentLinus = user.linus?.name;

  const checkLinusUnlocked = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/isUnlocked/69f10cf39507471203ed993a`,
      );
      const data = await response.json();
      setIsLinusUnlocked(data.isUnlocked);
    } catch (err) {
      console.error(err.message);
      return;
    }
  };

  const checkLinusPerson = async () => {
    try {
      if (isLinusUnlocked) {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/linus`,
        );
        const data = await response.json();
        if (data.result) {
          dispatch(changeLinusStore(data.linus));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getRandomCitation();
    getWeather();
  }, []);

  useEffect(() => {
    checkLinusUnlocked();
    checkLinusPerson();
  }, [isFocused]);

  const checkName = () => {
    if (user.name.includes("-")) {
      let composedName = user.name.split("-");
      composedName =
        composedName[0][0].toUpperCase() +
        composedName[0].slice(1) +
        " " +
        composedName[1].toUpperCase();
      return composedName;
    } else {
      let regularName = user.name[0].toUpperCase() + user.name.slice(1);
      return regularName;
    }
  };

  const finalName = checkName();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤙 Salut {finalName} !</Text>
      {quote === null ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.citationContainer}>
          <Text style={styles.citationText}>{quote.texte}</Text>
          <Text style={styles.citationAuthor}>{quote.auteur}</Text>
          <Pressable onPress={() => window.open(quote.lien, "_blank")}>
            <Text style={styles.citationLink}>En savoir plus</Text>
          </Pressable>
        </View>
      )}
      {currentLinus && isLinusUnlocked ? (
        <Text style={styles.linusText}>
          {currentLinus[0].toUpperCase() + currentLinus.slice(1)} est Linus ! 🍹
        </Text>
      ) : null}
      {!weatherInfos || !weatherForecast ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherCity}>{weatherInfos.cityName}</Text>
          <View style={styles.sunriseContainer}>
            <Sunrise size={20} color={colors.white} />
            <Text style={styles.weatherSunrise}>{weatherInfos.sunrise}</Text>
            <Sunset size={20} color={colors.white} />
            <Text style={styles.weatherSunrise}>{weatherInfos.sunset}</Text>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastContainer}
          >
            {weatherForecastToDisplay}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  citationContainer: {
    padding: 20,
    minWidth: screenWidth * 0.7,
    maxWidth: screenWidth * 0.9,
    backgroundColor: colors.primary,
    opacity: 0.4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondaryLight,
  },
  citationText: {
    color: colors.white,
    fontSize: 18,
    textAlign: "justify",
    fontStyle: "italic",
    padding: 12,
    lineHeight: 26,
    fontWeight: "500",
  },
  linusText: {
    color: colors.white,
    backgroundColor: colors.primary,
    borderRadius: 14,
    fontSize: 18,
    textAlign: "center",
    padding: 14,
    width: screenWidth * 0.7,
    fontWeight: "600",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondaryLight,
  },
  citationAuthor: {
    color: colors.secondaryLight,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    padding: 12,
    marginVertical: 8,
    letterSpacing: 0.3,
  },
  citationLink: {
    color: colors.secondaryLight,
    padding: 12,
    fontSize: 14,
    textAlign: "center",
    borderWidth: 2,
    borderColor: colors.secondaryLight,
    borderRadius: 10,
    width: 160,
    alignSelf: "center",
    fontWeight: "600",
    backgroundColor: "transparent",
    letterSpacing: 0.3,
  },
  weatherContainer: {
    display: "flex",
    width: screenWidth * 0.9,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 16,
    elevation: 6,
  },
  weatherCity: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    padding: 10,
    letterSpacing: 0.3,
  },
  sunriseContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 5,
  },
  weatherSunrise: {
    color: colors.white,
    fontSize: 14,
    textAlign: "left",
    fontWeight: "600",
  },
  forecastContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 12,
    marginTop: 10,
    alignSelf: "center",
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    paddingTop: 10,
  },
  weatherForecastItem: {
    padding: 12,
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    alignItems: "center",
    marginHorizontal: 8,
  },
  weatherForecastTime: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    padding: 6,
    letterSpacing: 0.2,
  },
  weatherForecastTemp: {
    color: colors.secondaryLight,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    padding: 6,
  },
  weatherForecastIcon: {
    width: 60,
    height: 60,
  },
});
