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
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    if (!db) {
      throw new Error("Failed to open database connection");
    }
    return db;
  } catch (error) {
    console.error("Error opening database:", error);
    throw error;
  }
};

// Create menu table if it doesn't exist
export const createMenuTable = async (db: SQLite.SQLiteDatabase) => {
  if (!db) {
    throw new Error("Database connection is null in createMenuTable");
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
  } catch (error) {
    console.error("Error creating menu table:", error);
    throw error;
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
  await db.withTransactionAsync(async () => {
    for (const item of menuItems) {
      await db.runAsync(
        "INSERT INTO menu (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)",
        [item.name, item.price, item.description, item.image, item.category]
      );
    }
  });
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
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM menu"
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error("Error checking menu data:", error);
    return false;
  }
};

