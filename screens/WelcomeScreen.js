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
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSurprises, unlockSurprise } from "../reducers/surprises";
import { colors } from "./colors";
import { Sunrise, Sunset } from "lucide-react-native";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch();
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

  useEffect(() => {
    getRandomCitation();
    getWeather();
  }, []);

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🤙 Salut {user.name[0].toUpperCase() + user.name.slice(1)} !
      </Text>
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
  },
  title: {
    fontSize: 30,
    color: colors.secondary,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  citationContainer: {
    padding: 10,
    minWidth: screenWidth * 0.7,
    maxWidth: screenWidth * 0.9,
  },
  citationText: {
    color: colors.secondary,
    fontSize: 24,
    textAlign: "justify",
    fontStyle: "italic",
    padding: 10,
  },
  citationAuthor: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    padding: 10,
    marginVertical: 10,
  },
  citationLink: {
    color: colors.white,
    padding: 10,
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 5,
    width: 150,
    alignSelf: "center",
  },
  weatherContainer: {
    display: "flex",
    width: screenWidth * 0.75,
    height: screenHeight * 0.35,
    paddingBottom: 20,
  },
  weatherCity: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  sunriseContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  weatherSunrise: {
    color: colors.white,
    fontSize: 16,
    textAlign: "left",
  },
  forecastContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  weatherForecastItem: {
    padding: 10,
  },
  weatherForecastTime: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  weatherForecastTemp: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  weatherForecastIcon: {
    width: 100,
    height: 100,
  },
});
