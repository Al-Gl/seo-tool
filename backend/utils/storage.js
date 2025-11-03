/**
 * Persistent Storage Utility for Analysis Data
 * Provides file-based storage to survive server restarts
 */

const fs = require('fs');
const path = require('path');

// Storage configuration
const STORAGE_DIR = path.join(__dirname, '../data');
const ANALYSES_FILE = path.join(STORAGE_DIR, 'analyses.json');
const MAX_ANALYSES = 1000; // Limit to prevent file from growing too large

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('📁 Created storage directory:', STORAGE_DIR);
  }
}

/**
 * Load all analyses from disk
 * @returns {Map} Map of analysis ID to analysis data
 */
function loadAnalyses() {
  try {
    ensureStorageDir();
    
    if (!fs.existsSync(ANALYSES_FILE)) {
      console.log('📄 No existing analyses file, starting fresh');
      return new Map();
    }
    
    const data = fs.readFileSync(ANALYSES_FILE, 'utf8');
    const analysesObj = JSON.parse(data);
    
    // Convert object back to Map
    const analysesMap = new Map(Object.entries(analysesObj));
    
    console.log(`📥 Loaded ${analysesMap.size} analyses from disk`);
    
    // Log some details about loaded analyses
    let completedCount = 0;
    let pendingCount = 0;
    for (const [id, analysis] of analysesMap) {
      if (analysis.status === 'completed') {
        completedCount++;
      } else {
        pendingCount++;
      }
    }
    
    if (analysesMap.size > 0) {
      console.log(`  ✅ Completed: ${completedCount}, ⏳ In-progress/Pending: ${pendingCount}`);
    }
    
    return analysesMap;
    
  } catch (error) {
    console.error('❌ Error loading analyses from disk:', error.message);
    console.log('🔄 Starting with empty analysis storage');
    return new Map();
  }
}

/**
 * Save all analyses to disk
 * @param {Map} analysesMap - Map of analysis ID to analysis data
 */
function saveAnalyses(analysesMap) {
  try {
    ensureStorageDir();
    
    // Convert Map to object for JSON serialization
    const analysesObj = Object.fromEntries(analysesMap);
    
    // Clean up old analyses if we have too many
    const entries = Object.entries(analysesObj);
    if (entries.length > MAX_ANALYSES) {
      console.log(`🧹 Cleaning up old analyses (keeping ${MAX_ANALYSES} most recent)`);
      
      // Sort by creation date (most recent first) and keep only the newest ones
      entries.sort((a, b) => {
        const dateA = new Date(a[1].startedAt || 0);
        const dateB = new Date(b[1].startedAt || 0);
        return dateB - dateA;
      });
      
      const cleanedAnalyses = Object.fromEntries(entries.slice(0, MAX_ANALYSES));
      fs.writeFileSync(ANALYSES_FILE, JSON.stringify(cleanedAnalyses, null, 2));
      
      console.log(`💾 Saved ${Object.keys(cleanedAnalyses).length} analyses to disk (cleaned)`);
    } else {
      fs.writeFileSync(ANALYSES_FILE, JSON.stringify(analysesObj, null, 2));
      console.log(`💾 Saved ${Object.keys(analysesObj).length} analyses to disk`);
    }
    
  } catch (error) {
    console.error('❌ Error saving analyses to disk:', error.message);
  }
}

/**
 * Save a single analysis (used for incremental updates)
 * @param {Map} analysesMap - Current analyses map
 * @param {string} id - Analysis ID
 * @param {Object} analysisData - Analysis data to save
 */
function saveAnalysis(analysesMap, id, analysisData) {
  try {
    // Add timestamp for when it was last updated
    analysisData.lastUpdated = new Date().toISOString();
    
    // Update the map
    analysesMap.set(id, analysisData);
    
    // Save to disk
    saveAnalyses(analysesMap);
    
  } catch (error) {
    console.error(`❌ Error saving analysis ${id}:`, error.message);
  }
}

/**
 * Get storage statistics
 * @param {Map} analysesMap - Current analyses map
 * @returns {Object} Storage statistics
 */
function getStorageStats(analysesMap) {
  const stats = {
    totalAnalyses: analysesMap.size,
    completed: 0,
    pending: 0,
    failed: 0,
    cancelled: 0
  };
  
  for (const [id, analysis] of analysesMap) {
    switch (analysis.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'failed':
        stats.failed++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
      default:
        stats.pending++;
        break;
    }
  }
  
  return stats;
}

/**
 * Clean up old analyses based on age
 * @param {Map} analysesMap - Current analyses map
 * @param {number} maxAgeHours - Maximum age in hours (default: 24)
 * @returns {number} Number of analyses removed
 */
function cleanupOldAnalyses(analysesMap, maxAgeHours = 24) {
  const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
  let removedCount = 0;
  
  for (const [id, analysis] of analysesMap) {
    const analysisDate = new Date(analysis.startedAt || 0);
    if (analysisDate < cutoffTime) {
      analysesMap.delete(id);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old analyses (older than ${maxAgeHours} hours)`);
    saveAnalyses(analysesMap);
  }
  
  return removedCount;
}

module.exports = {
  loadAnalyses,
  saveAnalyses,
  saveAnalysis,
  getStorageStats,
  cleanupOldAnalyses,
  STORAGE_DIR,
  ANALYSES_FILE
};