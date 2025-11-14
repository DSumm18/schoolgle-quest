// Game logic for Schoolgle Quest - XP, quest, and creature systems

import type {
  PlayerProgress,
  Quest,
  QuestStatus,
  QuestObjective,
  Creature,
  CreatureType
} from "@schoolgle/shared";

// XP and Leveling System
export class XPSystem {
  // Calculate XP required for a given level
  static calculateXPForLevel(level: number): number {
    // Formula: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  // Calculate level from total XP
  static calculateLevelFromXP(totalXP: number): number {
    let level = 1;
    while (totalXP >= this.calculateXPForLevel(level)) {
      totalXP -= this.calculateXPForLevel(level);
      level++;
    }
    return level;
  }

  // Add XP to player and check for level up
  static addXP(
    progress: PlayerProgress,
    xpAmount: number
  ): { newProgress: PlayerProgress; leveledUp: boolean; newLevel?: number } {
    const currentXP = progress.xp + xpAmount;
    const xpNeeded = this.calculateXPForLevel(progress.level);

    if (currentXP >= xpNeeded) {
      // Level up!
      const newLevel = progress.level + 1;
      const remainingXP = currentXP - xpNeeded;

      return {
        newProgress: {
          ...progress,
          level: newLevel,
          xp: remainingXP,
          xpToNextLevel: this.calculateXPForLevel(newLevel)
        },
        leveledUp: true,
        newLevel
      };
    }

    return {
      newProgress: {
        ...progress,
        xp: currentXP
      },
      leveledUp: false
    };
  }
}

// Quest System
export class QuestSystem {
  // Check if a quest is available for a player
  static isQuestAvailable(quest: Quest, playerLevel: number): boolean {
    return playerLevel >= quest.requiredLevel;
  }

  // Check if all objectives are completed
  static isQuestComplete(quest: Quest): boolean {
    return quest.objectives.every((obj) => obj.completed);
  }

  // Update quest objective progress
  static updateObjective(
    quest: Quest,
    objectiveId: string,
    progress: number
  ): Quest {
    const updatedObjectives = quest.objectives.map((obj) => {
      if (obj.id === objectiveId) {
        const newCurrent = (obj.current || 0) + progress;
        const completed = obj.target ? newCurrent >= obj.target : true;

        return {
          ...obj,
          current: newCurrent,
          completed
        };
      }
      return obj;
    });

    const allComplete = updatedObjectives.every((obj) => obj.completed);

    return {
      ...quest,
      objectives: updatedObjectives,
      status: allComplete ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS
    };
  }

  // Complete a quest and award XP
  static completeQuest(
    quest: Quest,
    progress: PlayerProgress
  ): {
    newProgress: PlayerProgress;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  } {
    if (!this.isQuestComplete(quest)) {
      throw new Error("Quest objectives not completed");
    }

    const xpResult = XPSystem.addXP(progress, quest.xpReward);

    return {
      newProgress: {
        ...xpResult.newProgress,
        completedQuests: [...progress.completedQuests, quest.id]
      },
      xpGained: quest.xpReward,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel
    };
  }
}

// Creature System
export class CreatureSystem {
  // Generate a creature based on type and level
  static generateCreature(
    type: CreatureType,
    level: number,
    id?: string
  ): Creature {
    const baseStats = this.getBaseStats(type);

    return {
      id: id || `creature-${Date.now()}-${Math.random()}`,
      name: this.getCreatureName(type),
      type,
      level,
      health: baseStats.health * level,
      maxHealth: baseStats.health * level,
      attack: baseStats.attack * level,
      defense: baseStats.defense * level,
      abilities: baseStats.abilities
    };
  }

  // Get base stats for creature type
  private static getBaseStats(type: CreatureType): {
    health: number;
    attack: number;
    defense: number;
    abilities: string[];
  } {
    const stats = {
      [CreatureType.HR]: {
        health: 100,
        attack: 15,
        defense: 10,
        abilities: ["interview", "policy-check"]
      },
      [CreatureType.FINANCE]: {
        health: 80,
        attack: 20,
        defense: 8,
        abilities: ["audit", "budget-cut"]
      },
      [CreatureType.ESTATES]: {
        health: 120,
        attack: 18,
        defense: 15,
        abilities: ["maintenance", "security"]
      },
      [CreatureType.GDPR]: {
        health: 90,
        attack: 25,
        defense: 12,
        abilities: ["data-breach", "compliance"]
      },
      [CreatureType.COMPLIANCE]: {
        health: 95,
        attack: 16,
        defense: 14,
        abilities: ["inspection", "regulation"]
      },
      [CreatureType.TEACHING]: {
        health: 85,
        attack: 22,
        defense: 10,
        abilities: ["lesson-plan", "detention"]
      },
      [CreatureType.SEND]: {
        health: 110,
        attack: 14,
        defense: 16,
        abilities: ["support", "adaptation"]
      }
    };

    return stats[type];
  }

  // Get creature name
  private static getCreatureName(type: CreatureType): string {
    const names = {
      [CreatureType.HR]: "HR Guardian",
      [CreatureType.FINANCE]: "Budget Beast",
      [CreatureType.ESTATES]: "Facilities Phantom",
      [CreatureType.GDPR]: "Data Demon",
      [CreatureType.COMPLIANCE]: "Compliance Creature",
      [CreatureType.TEACHING]: "Teaching Terror",
      [CreatureType.SEND]: "SEND Sentinel"
    };

    return names[type];
  }

  // Calculate damage in battle
  static calculateDamage(
    attacker: Creature,
    defender: Creature,
    useAbility: boolean = false
  ): number {
    const baseDamage = attacker.attack - defender.defense / 2;
    const abilityMultiplier = useAbility ? 1.5 : 1;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

    return Math.max(
      1,
      Math.floor(baseDamage * abilityMultiplier * randomFactor)
    );
  }

  // Apply damage to creature
  static applyDamage(creature: Creature, damage: number): Creature {
    const newHealth = Math.max(0, creature.health - damage);

    return {
      ...creature,
      health: newHealth
    };
  }

  // Check if creature is defeated
  static isDefeated(creature: Creature): boolean {
    return creature.health <= 0;
  }
}

// World Generation Helpers
export class WorldGenerator {
  // Generate a simple seed from postcode for procedural generation
  static generateSeed(postcode: string): number {
    let seed = 0;
    for (let i = 0; i < postcode.length; i++) {
      seed = (seed << 5) - seed + postcode.charCodeAt(i);
      seed = seed & seed; // Convert to 32bit integer
    }
    return Math.abs(seed);
  }

  // Generate random number from seed
  static seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate school layout based on postcode
  static generateSchoolLayout(postcode: string): {
    buildingCount: number;
    terrainSize: number;
    creatureCount: number;
  } {
    const seed = this.generateSeed(postcode);
    const random1 = this.seededRandom(seed);
    const random2 = this.seededRandom(seed + 1);
    const random3 = this.seededRandom(seed + 2);

    return {
      buildingCount: Math.floor(3 + random1 * 7), // 3-10 buildings
      terrainSize: Math.floor(50 + random2 * 50), // 50-100 units
      creatureCount: Math.floor(2 + random3 * 6) // 2-8 creatures
    };
  }
}

// Export all systems
export { XPSystem, QuestSystem, CreatureSystem, WorldGenerator };
