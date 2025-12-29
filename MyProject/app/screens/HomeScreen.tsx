import * as React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  openDatabase,
  createMenuTable,
  getAllMenuItems,
  getMenuItemsByCategories,
  getMenuItemsBySearchAndCategories,
  getCategories,
  saveMenuItems,
  hasMenuData,
  MenuItem,
} from "../database/database";

const API_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

interface MenuData {
  menu: MenuItem[];
}

// Map API image names to local asset paths
const getImageSource = (imageName: string) => {
  const imageMap: { [key: string]: any } = {
    "greekSalad.jpg": require("@/assets/Little-Lemon-Images/Greek salad.png"),
    "bruschetta.jpg": require("@/assets/Little-Lemon-Images/Bruschetta.png"),
    "grilledFish.jpg": require("@/assets/Little-Lemon-Images/Grilled fish.png"),
    "pasta.jpg": require("@/assets/Little-Lemon-Images/Pasta.png"),
    "lemonDessert.jpg": require("@/assets/Little-Lemon-Images/Lemon dessert.png"),
  };
  return imageMap[imageName] || null;
};

function HomeScreen() {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        setError(null);

        const db = await openDatabase();
        if (!db) {
          throw new Error("Failed to open database connection");
        }

        await createMenuTable(db);

        // Check if data exists in database
        const hasData = await hasMenuData(db);

        if (hasData) {
          // Data exists, load from database
          const menuItems = await getAllMenuItems(db);
          const uniqueCategories = await getCategories(db);
          setMenuData(menuItems);
          setCategories(uniqueCategories);
          setIsDatabaseReady(true);
          setLoading(false);
        } else {
          // No data, fetch from API and store in database
          const response = await fetch(API_URL);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: MenuData = await response.json();
          const menuItems = data.menu || [];

          // Save menu items to database
          await saveMenuItems(db, menuItems);

          const uniqueCategories = await getCategories(db);
          setMenuData(menuItems);
          setCategories(uniqueCategories);
          setIsDatabaseReady(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing database:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
        setIsDatabaseReady(false);
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Debounce search query by 500ms
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Store initial menu data to fall back to if database queries fail
  const initialMenuDataRef = useRef<MenuItem[]>([]);

  // Save initial menu data when it's loaded
  useEffect(() => {
    if (menuData.length > 0 && initialMenuDataRef.current.length === 0) {
      initialMenuDataRef.current = menuData;
    }
  }, [menuData]);

  // Filter menu items based on search query and selected categories using SQL query
  useEffect(() => {
    let isMounted = true;

    const filterMenuItems = async () => {
      // Only filter if database is ready
      if (!isDatabaseReady || loading) {
        return;
      }

      try {
        // Verify database has data before querying
        const db = await openDatabase();
        if (!db || !isMounted) {
          return;
        }

        const hasData = await hasMenuData(db);
        if (!hasData) {
          console.warn("Database has no data, skipping filter");
          return;
        }

        const selectedCategoriesArray = Array.from(selectedCategories);
        const filteredItems = await getMenuItemsBySearchAndCategories(
          db,
          debouncedSearchQuery,
          selectedCategoriesArray
        );

        // Only update if component is still mounted and we got valid results
        if (isMounted && Array.isArray(filteredItems)) {
          setMenuData(filteredItems);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error filtering menu items:", err);
          // Fall back to initial data if available
          if (initialMenuDataRef.current.length > 0) {
            setMenuData(initialMenuDataRef.current);
          }
        }
      }
    };

    filterMenuItems();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery, selectedCategories, isDatabaseReady, loading]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const renderHeroBanner = useCallback(
    () => (
      <View style={styles.heroContainer}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Little Lemon</Text>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroDescription}>
              We are a family owned Mediterranean restaurant, focused on
              traditional recipes served with a modern twist.
            </Text>
          </View>
          <View style={styles.heroImageContainer}>
            <Image
              source={require("@/assets/Little-Lemon-Images/Hero image.png")}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
        </View>
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for dishes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    ),
    [searchQuery]
  );

  const renderCategoryFilter = useCallback(
    () => (
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => {
            const isSelected = selectedCategories.has(category);
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonSelected,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextSelected,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ),
    [categories, selectedCategories, toggleCategory]
  );

  const renderMenuItem = useCallback(({ item }: { item: MenuItem }) => {
    const imageSource = getImageSource(item.image);
    return (
      <View style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemText}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.itemCategory}>Category: {item.category}</Text>
          </View>
          {imageSource && (
            <Image
              source={imageSource}
              style={styles.menuItemImage}
              contentFit="cover"
            />
          )}
        </View>
      </View>
    );
  }, []);

  const headerComponent = useMemo(
    () => (
      <View style={styles.header}>
        {renderHeroBanner()}
        <View style={styles.orderSection}>
          <Text style={styles.title}>ORDER FOR DELIVERY!</Text>
          {renderCategoryFilter()}
        </View>
      </View>
    ),
    [renderHeroBanner, renderCategoryFilter]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#495E57" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Please try again later.</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No menu items available</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={menuData}
      renderItem={renderMenuItem}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      ListHeaderComponent={headerComponent}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 0,
  },
  heroContainer: {
    backgroundColor: "#495E57",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  heroContent: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 15,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#F4CE14",
    marginBottom: 8,
    fontFamily: "serif",
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 18,
    color: "white",
    lineHeight: 24,
  },
  heroImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  orderSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryButtonSelected: {
    backgroundColor: "#495E57",
    borderColor: "#495E57",
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  categoryButtonTextSelected: {
    color: "white",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  menuItem: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#F4F4F4",
    borderRadius: 8,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    marginRight: 15,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495E57",
    marginBottom: 5,
  },
  itemCategory: {
    fontSize: 12,
    color: "#999",
    textTransform: "capitalize",
  },
});

export default HomeScreen;
