import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import * as SQLite from "expo-sqlite";

const API_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

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

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        setError(null);

        // Open database
        const db = await SQLite.openDatabaseAsync("little_lemon");

        // Create table if it doesn't exist
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            category TEXT NOT NULL
          );
        `);

        // Check if data exists in database
        const result = await db.getAllAsync<MenuItem>(
          "SELECT name, price, description, image, category FROM menu"
        );

        if (result.length > 0) {
          // Data exists, load from database
          setMenuData(result);
          setLoading(false);
        } else {
          // No data, fetch from API and store in database
          const response = await fetch(API_URL);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: MenuData = await response.json();
          const menuItems = data.menu || [];

          // Insert menu items into database
          await db.withTransactionAsync(async () => {
            for (const item of menuItems) {
              await db.runAsync(
                "INSERT INTO menu (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)",
                [
                  item.name,
                  item.price,
                  item.description,
                  item.image,
                  item.category,
                ]
              );
            }
          });

          setMenuData(menuItems);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing database:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

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

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
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
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Menu</Text>
    </View>
  );

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
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
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
