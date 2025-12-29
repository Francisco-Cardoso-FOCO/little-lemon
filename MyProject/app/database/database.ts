import * as SQLite from "expo-sqlite";

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

const DATABASE_NAME = "little_lemon";

// Open database connection
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase | null> => {
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    if (!db) {
      console.error("Database connection is null");
      return null;
    }
    return db;
  } catch (error) {
    console.error("Error opening database:", error);
    return null;
  }
};

// Create menu table if it doesn't exist
export const createMenuTable = async (db: SQLite.SQLiteDatabase | null): Promise<boolean> => {
  if (!db) {
    console.error("Database connection is null in createMenuTable");
    return false;
  }
  
  try {
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
    return true;
  } catch (error) {
    console.error("Error creating menu table:", error);
    return false;
  }
};

// Get all menu items
export const getAllMenuItems = async (
  db: SQLite.SQLiteDatabase
): Promise<MenuItem[]> => {
  if (!db) {
    console.error("Database connection is null in getAllMenuItems");
    return [];
  }
  
  try {
    const result = await db.getAllAsync<MenuItem>(
      "SELECT name, price, description, image, category FROM menu"
    );
    return result || [];
  } catch (error) {
    console.error("Error getting all menu items:", error);
    // If table doesn't exist, return empty array
    return [];
  }
};

// Get menu items filtered by categories
export const getMenuItemsByCategories = async (
  db: SQLite.SQLiteDatabase,
  categories: string[]
): Promise<MenuItem[]> => {
  if (categories.length === 0) {
    return getAllMenuItems(db);
  }

  // Create placeholders for the IN clause
  const placeholders = categories.map(() => "?").join(",");
  const query = `SELECT name, price, description, image, category FROM menu WHERE category IN (${placeholders})`;

  const result = await db.getAllAsync<MenuItem>(query, categories);
  return result;
};

// Get menu items filtered by search text and categories (AND condition)
export const getMenuItemsBySearchAndCategories = async (
  db: SQLite.SQLiteDatabase,
  searchText: string,
  categories: string[]
): Promise<MenuItem[]> => {
  if (!db) {
    console.error("Database connection is null in getMenuItemsBySearchAndCategories");
    return [];
  }
  
  try {
    // If no filters are applied, return all items
    const hasSearchText = searchText.trim().length > 0;
    const hasCategories = categories.length > 0;

    if (!hasSearchText && !hasCategories) {
      return getAllMenuItems(db);
    }

    const conditions: string[] = [];
    const params: any[] = [];

    // Add search text filter (case-insensitive LIKE)
    if (hasSearchText) {
      conditions.push("name LIKE ?");
      params.push(`%${searchText.trim()}%`);
    }

    // Add category filter
    if (hasCategories) {
      const placeholders = categories.map(() => "?").join(",");
      conditions.push(`category IN (${placeholders})`);
      params.push(...categories);
    }

    // Build query - ensure we have at least one condition at this point
    if (conditions.length === 0) {
      return getAllMenuItems(db);
    }

    const query = `SELECT name, price, description, image, category FROM menu WHERE ${conditions.join(" AND ")}`;

    const result = await db.getAllAsync<MenuItem>(query, params);
    return result || [];
  } catch (error) {
    console.error("Error filtering menu items:", error);
    // Return empty array on error
    return [];
  }
};

// Get unique categories from menu
export const getCategories = async (
  db: SQLite.SQLiteDatabase
): Promise<string[]> => {
  if (!db) {
    console.error("Database connection is null in getCategories");
    return [];
  }
  
  try {
    const result = await db.getAllAsync<{ category: string }>(
      "SELECT DISTINCT category FROM menu ORDER BY category"
    );
    return result ? result.map((row) => row.category) : [];
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
};

// Save menu items to database
export const saveMenuItems = async (
  db: SQLite.SQLiteDatabase,
  menuItems: MenuItem[]
): Promise<void> => {
  if (!db) {
    throw new Error("Database connection is null in saveMenuItems");
  }
  
  if (!menuItems || menuItems.length === 0) {
    console.warn("No menu items to save");
    return;
  }
  
  try {
    // First, clear existing data to avoid duplicates
    await db.runAsync("DELETE FROM menu");
    
    // Then insert all items in a transaction
    await db.withTransactionAsync(async () => {
      for (const item of menuItems) {
        await db.runAsync(
          "INSERT INTO menu (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)",
          [item.name, item.price, item.description, item.image, item.category]
        );
      }
    });
    
  } catch (error) {
    console.error("Error saving menu items:", error);
    throw error;
  }
};

// Check if menu table has data
export const hasMenuData = async (
  db: SQLite.SQLiteDatabase
): Promise<boolean> => {
  if (!db) {
    console.error("Database connection is null in hasMenuData");
    return false;
  }
  
  try {
    // Try to get a single row instead of counting (lighter query)
    // This will return null if table is empty or doesn't exist
    const result = await db.getFirstAsync<MenuItem>(
      "SELECT name, price, description, image, category FROM menu LIMIT 1"
    );
    return result !== null;
  } catch (error) {
    // If query fails (table doesn't exist or other error), return false
    // This is expected on first run when table doesn't exist yet
    console.warn("Menu table may not exist yet or query failed:", error);
    return false;
  }
};

