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
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useIsFocused } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGuest, setUserList } from "../reducers/user";
import { setSurprises, setSelectedSurprise } from "../reducers/surprises";
import { colors } from "./colors";
import { Eye, EyeOff, CircleArrowRight, Trash } from "lucide-react-native";
import { showMessage } from "react-native-flash-message";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function OptionsScreen() {
  const surprises = useSelector((state) => state.surprises.surprises).toSorted(
    (a, b) => a.revealAt > b.revealAt,
  );
  const selectedSurpriseId = useSelector(
    (state) => state.surprises.selectedSurprise?._id,
  );
  const selectedSurprise = useSelector((state) =>
    state.surprises.surprises.find(
      (surprise) => surprise._id === selectedSurpriseId,
    ),
  );

  const guestsList = useSelector((state) => state.user.userList).toSorted(
    (a, b) => a.name > b.name,
  );

  const selectedGuestId = useSelector((state) => state.user.selectedGuest?._id);
  const selectedGuest = useSelector((state) =>
    state.user.userList.find((guest) => guest._id === selectedGuestId),
  );

  const isFocused = useIsFocused();
  const [focus, setFocus] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateList = [
    { slug: "guest", display: "Ajouter invité.e" },
    { slug: "updateGuest", display: "Modifier invité.e" },
    { slug: "surprise", display: "Ajouter surprise" },
    { slug: "updateSurprise", display: "Modifier surprise" },
  ];
  const [typeOfUpdate, setTypeOfUpdate] = useState(updateList[0].slug); // guest || updateGuest || surprise || updatSurprise

  // Guest
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef(null);
  const [passwordCheck, setPasswordCheck] = useState("");
  const passwordCheckRef = useRef(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const statusList = ["guest", "guest+", "guest-", "star"];
  const [status, setStatus] = useState(statusList[0]);
  const statusRef = useRef(null);

  const resetGuestInputs = () => {
    setName("");
    setPassword("");
    setPasswordCheck("");
    setStatus(statusList[0]);
  };

  const validateInputs = () => {
    if (!name || !password || !passwordCheck || !status) {
      setErrorMessage("Remplir tous les champs.");
      return false;
    }

    if (password !== passwordCheck) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const togglePasswordCheckVisibility = () => {
    setIsPasswordCheckVisible((prev) => !prev);
  };

  const handleSignup = async () => {
    setErrorMessage("");
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password, status }),
        },
      );

      const data = await response.json();
      if (data.result) {
        resetGuestInputs();
        showMessage({
          message: data.message,
          type: "success",
        });
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusDropDown = statusList.map((status, i) => {
    return <Picker.Item key={i} label={status} value={status} />;
  });

  // surprise
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(
    selectedSurprise?.description || "",
  );
  const [type, setType] = useState("");
  const possibleTypes = ["Happening", "Activité", "Confort", "Cadeau"];
  const [organizerName, setOrganizerName] = useState(
    user.name[0].toUpperCase() + user.name.slice(1),
  );
  const possibleRevealModes = ["Time", "Manual", "Riddle"];
  const [revealMode, setRevealMode] = useState(possibleRevealModes[0]);
  const [revealAt, setRevealAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [riddle, setRiddle] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [notes, setNotes] = useState("");

  const resetSurpriseInputs = () => {
    setTitle("");
    setDescription("");
    setType("");
    setOrganizerName(user.name[0].toUpperCase() + user.name.slice(1));
    setRevealMode(possibleRevealModes[0]);
    setRevealAt("");
    setRiddle("");
    setHint("");
    setAnswer("");
    setNotes("");
  };

  const validateSurpriseInputs = () => {
    if (!title || !description || !organizerName || !revealMode || !revealAt) {
      setErrorMessage("Remplir tous les champs.");
      return false;
    }

    return true;
  };

  const handleNewSurprise = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (!validateSurpriseInputs()) {
        return;
      }

      const surprise = {
        title,
        description,
        type,
        organizerName: organizerName.toLowerCase(),
        revealMode: revealMode.toLowerCase(),
        revealAt,
        riddle,
        answer,
        hint,
        notes,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surprise),
        },
      );

      const data = await response.json();
      if (data.result) {
        showMessage({
          message: data.message,
          type: "success",
        });
        resetSurpriseInputs();
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur: ", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // updateSurprise
  const getSurprises = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/all`,
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

  useEffect(() => {
    getSurprises();
  }, [typeOfUpdate]);

  useEffect(() => {
    if (selectedSurprise && typeOfUpdate === "updateSurprise") {
      setTitle(selectedSurprise.title);
      setDescription(selectedSurprise.description);
      setType(selectedSurprise.type);
      setOrganizerName(selectedSurprise.organizedBy?.name);
      setRevealMode(selectedSurprise.revealMode);
      setRevealAt(new Date(selectedSurprise.revealAt));
      setRiddle(selectedSurprise.riddle || "");
      setHint(selectedSurprise.hint || "");
      setAnswer(selectedSurprise.answer || "");
      setNotes(selectedSurprise.notes || "");
    } else if (typeOfUpdate !== "updateSurprise") {
      resetSurpriseInputs();
      dispatch(setSelectedSurprise(null));
    }
  }, [selectedSurprise, typeOfUpdate]);

  const deleteSurprise = async (surpriseId) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette surprise ?",
    );
    if (confirmed) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/${surpriseId}`,
          {
            method: "DELETE",
            // headers: {"Content-Type": "application/json"}
          },
        );

        const data = await response.json();

        if (data.result) {
          showMessage({
            message: data.message,
            type: "success",
          });
          resetSurpriseInputs();
          setSelectedSurprise(null);
          getSurprises();
        } else {
          setErrorMessage("Erreur : ", data.message);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur : ", err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const surprisesList = surprises.map((surprise, i) => {
    const isSelected = selectedSurprise?._id === surprise._id;

    return (
      <Pressable
        key={i}
        onPress={() => dispatch(setSelectedSurprise(surprise))}
        style={[styles.surpriseListItem, isSelected && styles.selectedListItem]}
      >
        <Text style={styles.surpriseListText} numberOfLines={1}>
          {i + 1} | {surprise.title}
        </Text>
        <CircleArrowRight
          size={15}
          color={isSelected ? colors.white : colors.lightGray}
        />
      </Pressable>
    );
  });

  const handleUpdateSurprise = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (!validateSurpriseInputs()) {
        return;
      }

      const surprise = {
        _id: selectedSurprise._id,
        title,
        description,
        type,
        organizerName: organizerName.toLowerCase(),
        revealMode: revealMode.toLowerCase(),
        revealAt,
        riddle,
        answer,
        hint,
        notes,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/update/${surprise._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surprise),
        },
      );

      const data = await response.json();

      if (data.result) {
        showMessage({
          message: data.message,
          type: "success",
        });
        resetSurpriseInputs();
        dispatch(setSelectedSurprise(null));
        getSurprises();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const typesDropDown = possibleTypes.map((type, i) => {
    return <Picker.Item key={i} label={type} value={type} />;
  });

  const revealDropDown = possibleRevealModes.map((reveal, i) => {
    return <Picker.Item key={i} label={reveal} value={reveal} />;
  });

  const updateButtons = updateList.map((update, i) => {
    return (
      <Pressable
        key={i}
        style={styles.contentHeaderBtn}
        onPress={() => {
          setTypeOfUpdate(update.slug);
        }}
      >
        <Text style={styles.contentHeaderText}>{update.display}</Text>
      </Pressable>
    );
  });

  // updatGuest
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

  useEffect(() => {
    if (selectedGuest && typeOfUpdate === "updateGuest") {
      setName(selectedGuest.name);
      setStatus(selectedGuest.status);
    } else if (typeOfUpdate !== "updateGuest") {
      resetGuestInputs();
      dispatch(setSelectedGuest(null));
    }
  }, [selectedGuest, typeOfUpdate]);

  useEffect(() => {
    getAllUsers();
  }, []);

  const checkName = (user) => {
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

  const guestsListDisplay = guestsList.map((guest, i) => {
    const isSelected = selectedGuest?._id === guest._id;
    const statusDisplay =
      guest.status === "guest"
        ? "Invité.e"
        : guest.status === "guest-"
          ? "Invité.e absent"
          : guest.status === "star"
            ? "Star"
            : "Admin";
    return (
      <Pressable
        key={i}
        onPress={() => {
          dispatch(setSelectedGuest(guest));
        }}
        style={[styles.surpriseListItem, isSelected && styles.selectedListItem]}
      >
        <Text style={styles.surpriseListText} numberOfLines={1}>
          {i + 1} | {checkName(guest)} | {statusDisplay}
        </Text>
        <CircleArrowRight
          size={15}
          color={isSelected ? colors.white : colors.lightGray}
        />
      </Pressable>
    );
  });

  const validateGuestUpdateInputs = () => {
    if (!name || !status) {
      setErrorMessage("Remplir nom, statut");
      return false;
    }

    if (password === passwordCheck && password !== "" && passwordCheck !== "") {
      setErrorMessage("Les mots de passe sont identiques !");
      return false;
    }
    return true;
  };

  const handleUpdateGuest = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (!validateGuestUpdateInputs()) {
        return;
      }

      const guest = {
        _id: selectedGuest._id,
        name,
        oldPassword: password,
        newPassword: passwordCheck,
        status,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/update/${guest._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guest),
        },
      );

      const data = await response.json();

      if (data.result) {
        showMessage({
          message: data.message,
          type: "success",
        });
        resetGuestInputs();
        getAllUsers();
        dispatch(setSelectedGuest(null));
      }
    } catch (err) {
      setErrorMessage(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGuest = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet.te invité.e ?",
    );
    if (confirmed) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/delete/${selectedGuestId}`,
          {
            method: "DELETE",
          },
        );

        const data = await response.json();

        if (data.result) {
          showMessage({
            message: data.message,
            type: "success",
          });
          resetGuestInputs();
          setSelectedGuest(null);
          getAllUsers();
        } else {
          setErrorMessage("Erreur : ", data.message);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur : ", err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Réglages</Text>
        <Text style={styles.subtitle}>Modifier guests et surprises</Text>
      </View>
      {isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.contentHeader}>{updateButtons}</View>

          {(typeOfUpdate === "guest" || typeOfUpdate === "updateGuest") && (
            <ScrollView
              contentContainerStyle={styles.guestFormContainer}
              showVerticalScrollIndicator={false}
            >
              {/*  sert à regrouper le formulaire */}
              {typeOfUpdate === "updateGuest" && (
                <View style={styles.surprisesList}>{guestsListDisplay}</View>
              )}
              <View>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Alexandre"
                  placeholderTextColor={colors.lightGray}
                  value={name}
                  onChangeText={setName}
                  keyboardType="default"
                  returnKeyType="next"
                  autoCapitalize="words"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => setFocus("name")}
                  onBlur={() => setFocus(null)}
                />
              </View>
              <View>
                {typeOfUpdate === "guest" ? (
                  <Text style={styles.label}>Mot de passe</Text>
                ) : (
                  <Text style={styles.label}>Ancien mot de passe</Text>
                )}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordText}
                    ref={passwordRef}
                    placeholder="************"
                    placeholderTextColor={colors.lightGray}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    returnKeyType="done"
                    onSubmitEditing={() => passwordCheckRef.current?.focus()}
                    onFocus={() => setFocus("password")}
                    onBlur={() => setFocus(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable onPress={togglePasswordVisibility}>
                    {isPasswordVisible ? (
                      <EyeOff size={20} color={colors.lightGray} />
                    ) : (
                      <Eye size={20} color={colors.lightGray} />
                    )}
                  </Pressable>
                </View>
                {typeOfUpdate === "guest" ? (
                  <Text style={styles.label}>Confirmation mot de passe</Text>
                ) : (
                  <Text style={styles.label}>Nouveau mot de passe</Text>
                )}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordText}
                    ref={passwordCheckRef}
                    placeholder="************"
                    placeholderTextColor={colors.lightGray}
                    value={passwordCheck}
                    onChangeText={setPasswordCheck}
                    secureTextEntry={!isPasswordCheckVisible}
                    returnKeyType="next"
                    onSubmitEditing={() => statusRef.current?.focus()}
                    onFocus={() => setFocus("passwordCheck")}
                    onBlur={() => setFocus(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable onPress={togglePasswordCheckVisibility}>
                    {isPasswordCheckVisible ? (
                      <EyeOff size={20} color={colors.lightGray} />
                    ) : (
                      <Eye size={20} color={colors.lightGray} />
                    )}
                  </Pressable>
                </View>
              </View>
              <View>
                <Text style={styles.label}>Statut</Text>
                <Picker
                  style={styles.input}
                  selectedValue={status}
                  onValueChange={(value) => setStatus(value)}
                >
                  {statusDropDown}
                </Picker>
              </View>
              {errorMessage !== "" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <Pressable
                style={styles.buttonPrimary}
                onPress={
                  typeOfUpdate === "guest" ? handleSignup : handleUpdateGuest
                }
              >
                <Text style={styles.buttonPrimaryText}>
                  {typeOfUpdate === "guest"
                    ? " Nouvel.le utilisateur.ice"
                    : "Mettre à jour"}
                </Text>
              </Pressable>
              {typeOfUpdate === "updateGuest" && (
                <Pressable
                  onPress={() => handleDeleteGuest()}
                  style={styles.deleteBtn}
                >
                  <Trash size={30} color={colors.white} />
                </Pressable>
              )}
            </ScrollView>
          )}
          {(typeOfUpdate === "surprise" || "updateSurprise") && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.masterScrollView}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {/*  sert à regrouper le formulaire */}
              {typeOfUpdate === "updateSurprise" && (
                <View style={styles.surprisesList}>{surprisesList}</View>
              )}
              {errorMessage !== "" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <View>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titre"
                  placeholderTextColor={colors.lightGray}
                  value={title}
                  onChangeText={setTitle}
                  keyboardType="default"
                  returnKeyType="next"
                  autoCapitalize="sentences"
                  onFocus={() => setFocus("titre")}
                  onBlur={() => setFocus(null)}
                  autoCorrect={true}
                />
              </View>
              <View>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  placeholderTextColor={colors.lightGray}
                  value={description}
                  onChangeText={setDescription}
                  returnKeyType="next"
                  onFocus={() => setFocus("description")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="none"
                  autoCorrect={true}
                />
              </View>
              <View>
                <Text style={styles.label}>Type de surprise</Text>
                <Picker
                  style={styles.input}
                  selectedValue={type}
                  onValueChange={(value) => setType(value)}
                >
                  {typesDropDown}
                </Picker>
              </View>
              <View>
                <Text style={styles.label}>Organisateur.ice *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Organisateur.ice"
                  placeholderTextColor={colors.lightGray}
                  value={organizerName}
                  onChangeText={setOrganizerName}
                  returnKeyType="next"
                  onFocus={() => setFocus("organisateur.ice")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View>
                <Text style={styles.label}>Mode de révélation *</Text>
                <Picker
                  style={styles.input}
                  selectedValue={revealMode}
                  onValueChange={(value) => setRevealMode(value)}
                >
                  {revealDropDown}
                </Picker>
              </View>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.label}>Date & heure révélation *</Text>
                {Platform.OS === "web" ? (
                  <input
                    type="datetime-local"
                    style={styles.dateInput}
                    onChange={(e) => setRevealAt(e.target.value)}
                  ></input>
                ) : (
                  <>
                    <Pressable
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>{`${revealAt.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "numeric" })} à ${revealAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}</Text>
                    </Pressable>
                    {showDatePicker && (
                      <DateTimePicker
                        value={revealAt}
                        mode="datetime"
                        display="spinner"
                        onChange={(e, selectedDate) => {
                          setShowDatePicker(false);
                          selectedDate && setRevealAt(selectedDate);
                        }}
                        locale="fr-FR"
                      />
                    )}
                  </>
                )}
              </View>
              <View>
                <Text style={styles.label}>Énigme</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optionnel"
                  placeholderTextColor={colors.lightGray}
                  value={riddle}
                  onChangeText={setRiddle}
                  returnKeyType="next"
                  onFocus={() => setFocus("énigme")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
              </View>
              <View>
                <Text style={styles.label}>Indice</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optionnel"
                  placeholderTextColor={colors.lightGray}
                  value={hint}
                  onChangeText={setHint}
                  returnKeyType="next"
                  onFocus={() => setFocus("indice")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
              </View>
              <View>
                <Text style={styles.label}>Réponse à l'énigme</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optionnel, une seule réponse"
                  placeholderTextColor={colors.lightGray}
                  value={answer}
                  onChangeText={setAnswer}
                  returnKeyType="next"
                  onFocus={() => setFocus("réponse")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
              </View>
              <View>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optionnel, uniquement pour les guests"
                  placeholderTextColor={colors.lightGray}
                  value={notes}
                  onChangeText={setNotes}
                  returnKeyType="go"
                  onSubmitEditing={() => {
                    typeOfUpdate === "surprise"
                      ? handleNewSurprise()
                      : handleUpdateSurprise();
                  }}
                  onFocus={() => setFocus("notes")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
              </View>

              <Pressable
                style={styles.buttonPrimary}
                onPress={() => {
                  typeOfUpdate === "surprise"
                    ? handleNewSurprise()
                    : handleUpdateSurprise();
                }}
              >
                <Text style={styles.buttonPrimaryText}>
                  {typeOfUpdate === "surprise" ? "Créer" : "Mettre à jour"}
                </Text>
              </Pressable>
              {typeOfUpdate === "updateSurprise" && (
                <Pressable
                  onPress={() => deleteSurprise(selectedSurprise._id)}
                  style={styles.deleteBtn}
                >
                  <Trash size={30} color={colors.white} />
                </Pressable>
              )}
            </ScrollView>
          )}

          <View style={{ marginBottom: 60 }} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    maxHeight: screenHeight * 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
  },
  subtitle: {
    color: colors.primary,
    textAlign: "center",
  },
  content: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 40,
    flex: 1,
  },
  guestFormContainer: {
    paddingBottom: 100,
  },
  contentHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 20,
  },
  contentHeaderBtn: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 25,
    padding: 10,
  },
  contentHeaderText: {
    color: colors.white,
    fontWeight: "bold",
  },
  label: {
    color: colors.lightGray,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    color: colors.white,
    backgroundColor: colors.primaryLight,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  dateInput: {
    width: "91%",
    color: colors.white,
    backgroundColor: colors.primaryLight,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    color: colors.destructive,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  buttonPrimaryText: {
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: colors.white,
    backgroundColor: colors.primaryLight,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  passwordText: {
    color: colors.white,
    flex: 1,
  },
  surprisesList: {
    maxHeight: 150,
    marginVertical: 10,
    overflow: "scroll",
  },
  surpriseListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  surpriseListText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  selectedListItem: {
    borderColor: colors.white,
    borderWidth: 2,
    backgroundColor: colors.secondary,
  },
  masterScrollView: {
    paddingBottom: 100,
  },
  deleteBtn: {
    width: "100%",
    backgroundColor: colors.destructive,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    padding: 10,
    opacity: 0.9,
  },
});
