// Shared core types for Schoolgle Quest

// User and Authentication
export interface User {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin"
}

// School
export interface School {
  id: string;
  name: string;
  postcode: string;
  address: string;
  latitude: number;
  longitude: number;
  type: SchoolType;
  createdAt: Date;
  updatedAt: Date;
}

export enum SchoolType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  SPECIAL = "special"
}

// Creature (for the game world)
export interface Creature {
  id: string;
  name: string;
  type: CreatureType;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  modelUrl?: string;
  abilities: string[];
  position?: Vector3; // Optional position in 3D space
}

export enum CreatureType {
  HR = "hr",
  FINANCE = "finance",
  ESTATES = "estates",
  GDPR = "gdpr",
  COMPLIANCE = "compliance",
  TEACHING = "teaching",
  SEND = "send"
}

// Quest
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  xpReward: number;
  requiredLevel: number;
  objectives: QuestObjective[];
  status: QuestStatus;
  createdBy?: string;
  schoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum QuestType {
  MATHS = "maths",
  SPELLING = "spelling",
  READING = "reading",
  LOCAL_KNOWLEDGE = "local_knowledge",
  EXPLORATION = "exploration",
  COLLECTION = "collection"
}

export enum QuestDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export enum QuestStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  type: ObjectiveType;
  target?: number;
  current?: number;
}

export enum ObjectiveType {
  VISIT_LOCATION = "visit_location",
  ANSWER_QUESTION = "answer_question",
  COLLECT_ITEM = "collect_item",
  DEFEAT_CREATURE = "defeat_creature"
}

// Player Progress
export interface PlayerProgress {
  id: string;
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedQuests: string[];
  inventory: InventoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  rarity: ItemRarity;
}

export enum ItemType {
  CONSUMABLE = "consumable",
  EQUIPMENT = "equipment",
  QUEST_ITEM = "quest_item",
  COLLECTIBLE = "collectible"
}

export enum ItemRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary"
}

// Location (for real-world exploration)
export interface Location {
  id: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  postcode: string;
  safetyRating: number;
  description?: string;
  questIds?: string[];
}

export enum LocationType {
  PARK = "park",
  LIBRARY = "library",
  PLAYGROUND = "playground",
  MUSEUM = "museum",
  HISTORIC_SITE = "historic_site"
}

// 3D World
export interface WorldData {
  id: string;
  schoolId: string;
  postcode: string;
  buildings: Building[];
  terrain: TerrainData;
  creatures: Creature[];
  generatedAt: Date;
}

export interface Building {
  id: string;
  type: BuildingType;
  position: Vector3;
  size: Vector3;
  color?: string;
  textureUrl?: string;
  name?: string; // Building name from OSM (e.g. "St Mary's Primary School")
  amenity?: string; // OSM amenity tag (e.g. "school", "library")
  isMainSchool?: boolean; // Flag to highlight the primary school for this postcode
}

export enum BuildingType {
  MAIN_BUILDING = "main_building",
  CLASSROOM = "classroom",
  LIBRARY = "library",
  GYM = "gym",
  CAFETERIA = "cafeteria",
  OFFICE = "office"
}

export interface TerrainData {
  size: Vector3;
  heightMap?: number[][];
  textureUrl?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PostcodeData {
  postcode: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  ward?: string;
}

export interface SchoolSearchResult {
  name: string;
  postcode: string;
  address: string;
  type: SchoolType;
  distance?: number;
}
