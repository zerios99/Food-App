import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch favorites");

        const data = await response.json();

        // التحقق من نوع البيانات المُرجعة
        let favorites = [];

        if (Array.isArray(data)) {
          // إذا كان الرد مصفوفة مباشرة
          favorites = data;
        } else if (data && Array.isArray(data.favorites)) {
          // إذا كان الرد كائن يحتوي على خاصية favorites
          favorites = data.favorites;
        } else if (data && Array.isArray(data.data)) {
          // إذا كان الرد كائن يحتوي على خاصية data
          favorites = data.data;
        } else {
          // في حالة عدم وجود بيانات صالحة
          console.log("Unexpected data format:", data);
          favorites = [];
        }

        // transform the data to match the RecipeCard component's expected format
        const transformedFavorites = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipeId || favorite.id,
        }));

        setFavoriteRecipes(transformedFavorites);
      } catch (error) {
        console.log("Error loading favorites", error);
        // لا نعرض Alert إلا في حالة خطأ حقيقي من الشبكة
        // إذا كانت القائمة فارغة فقط، نتركها فارغة
        if (error.message !== "Failed to fetch favorites") {
          Alert.alert("Error", "Failed to load favorites");
        }
        setFavoriteRecipes([]); // تأكد من أن القائمة فارغة عند الخطأ
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;

  return (
    <View style={favoritesStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>Favorites</Text>
          <TouchableOpacity
            style={favoritesStyles.logoutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection}>
          <FlatList
            data={favoriteRecipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            numColumns={2}
            columnWrapperStyle={favoritesStyles.row}
            contentContainerStyle={favoritesStyles.recipesGrid}
            scrollEnabled={false}
            ListEmptyComponent={<NoFavoritesFound />}
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default FavoritesScreen;
