const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class DatabaseService {
  constructor() {
    this.db = null;
    // Use a different path when running outside of Electron
    const dataDir = process.env.ELECTRON_MAIN_PROCESS
      ? require('electron').app.getPath('userData')
      : path.join(os.homedir(), '.lossly');
    this.dbPath = path.join(dataDir, 'lossly.db');
  }

  async initialize () {
    // Ensure the data directory exists
    const dataDir = path.dirname(this.dbPath);
    await fs.mkdir(dataDir, { recursive: true });

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Failed to open database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async createTables () {
    const queries = [
      // History table
      `CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        original_name TEXT NOT NULL,
        original_path TEXT NOT NULL,
        original_size INTEGER NOT NULL,
        original_format TEXT NOT NULL,
        output_name TEXT,
        output_path TEXT,
        output_size INTEGER,
        output_format TEXT,
        compressed_size INTEGER,
        saved_bytes INTEGER,
        reduction_percentage REAL,
        processing_time INTEGER,
        type TEXT DEFAULT 'compression',
        settings TEXT,
        timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Presets table
      `CREATE TABLE IF NOT EXISTS presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        settings TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Batch jobs table
      `CREATE TABLE IF NOT EXISTS batch_jobs (
        id TEXT PRIMARY KEY,
        status TEXT DEFAULT 'pending',
        total_items INTEGER DEFAULT 0,
        completed_items INTEGER DEFAULT 0,
        failed_items INTEGER DEFAULT 0,
        total_saved INTEGER DEFAULT 0,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )`,

      // Batch items table
      `CREATE TABLE IF NOT EXISTS batch_items (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        original_name TEXT NOT NULL,
        original_path TEXT NOT NULL,
        original_size INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        output_path TEXT,
        output_size INTEGER,
        error_message TEXT,
        client_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES batch_jobs(id)
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_history_type ON history(type)`,
      `CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON batch_items(batch_id)`,
      `CREATE INDEX IF NOT EXISTS idx_batch_items_status ON batch_items(status)`,
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Add client_id column if it doesn't exist (migration)
    try {
      await this.run('ALTER TABLE batch_items ADD COLUMN client_id TEXT');
      console.log('Added client_id column to batch_items table');
    } catch (err) {
      // Column already exists, ignore the error
      if (!err.message.includes('duplicate column name')) {
        console.error('Error adding client_id column:', err);
      }
    }
  }

  // Promisified database methods
  run (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // History methods
  async addHistoryItem (item) {
    // Validate and sanitize data to prevent NaN/undefined values
    const validateNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : num;
    };

    const sql = `
      INSERT INTO history (
        id, original_name, original_path, original_size, original_format,
        output_name, output_path, output_size, output_format,
        compressed_size, saved_bytes, reduction_percentage,
        processing_time, type, settings, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      item.id || Date.now().toString(),
      item.originalName || 'unknown',
      item.originalPath || '',
      validateNumber(item.originalSize, 0),
      item.originalFormat || 'unknown',
      item.outputName || '',
      item.outputPath || '',
      validateNumber(item.outputSize, 0),
      item.outputFormat || 'unknown',
      validateNumber(item.compressedSize, 0),
      validateNumber(item.savedBytes, 0),
      validateNumber(item.reductionPercentage, 0),
      validateNumber(item.processingTime, 0),
      item.type || 'compression',
      JSON.stringify(item.settings || {}),
      item.timestamp || new Date().toISOString(),
    ];

    return this.run(sql, params);
  }

  async getHistory (limit = 100, offset = 0) {
    const sql = `
      SELECT * FROM history
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await this.all(sql, [limit, offset]);
    return rows.map((row) => ({
      id: row.id,
      originalName: row.original_name,
      originalPath: row.original_path,
      originalSize: row.original_size || 0,
      originalFormat: row.original_format,
      outputName: row.output_name,
      outputPath: row.output_path,
      outputSize: row.output_size || 0,
      outputFormat: row.output_format,
      compressedSize: row.compressed_size || row.output_size || 0,
      savedBytes: row.saved_bytes || 0,
      reductionPercentage: row.reduction_percentage || 0,
      processingTime: row.processing_time || 0,
      type: row.type,
      timestamp: row.timestamp,
      settings: row.settings ? JSON.parse(row.settings) : null,
    }));
  }

  async deleteHistoryItem (id) {
    return this.run('DELETE FROM history WHERE id = ?', [id]);
  }

  async clearHistory () {
    return this.run('DELETE FROM history');
  }

  async cleanOldHistory (daysToKeep) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const sql = 'DELETE FROM history WHERE timestamp < ?';
    return this.run(sql, [cutoffDate.toISOString()]);
  }

  // Settings methods
  async getSetting (key) {
    const row = await this.get('SELECT value FROM settings WHERE key = ?', [key]);
    return row ? JSON.parse(row.value) : null;
  }

  async setSetting (key, value) {
    const sql = `
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    return this.run(sql, [key, JSON.stringify(value)]);
  }

  async getAllSettings () {
    const rows = await this.all('SELECT * FROM settings');
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = JSON.parse(row.value);
    });
    return settings;
  }

  // Presets methods
  async addPreset (preset) {
    const sql = `
      INSERT INTO presets (id, name, settings)
      VALUES (?, ?, ?)
    `;
    const params = [
      preset.id || Date.now().toString(),
      preset.name,
      JSON.stringify(preset.settings),
    ];
    return this.run(sql, params);
  }

  async getPresets () {
    const rows = await this.all('SELECT * FROM presets ORDER BY created_at DESC');
    return rows.map((row) => ({
      ...row,
      settings: JSON.parse(row.settings),
    }));
  }

  async deletePreset (id) {
    return this.run('DELETE FROM presets WHERE id = ?', [id]);
  }

  // Batch methods
  async createBatchJob (settings) {
    const sql = `
      INSERT INTO batch_jobs (id, settings)
      VALUES (?, ?)
    `;
    const id = Date.now().toString();
    await this.run(sql, [id, JSON.stringify(settings || {})]);
    return id;
  }

  async updateBatchJob (id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    values.push(id);
    const sql = `UPDATE batch_jobs SET ${fields.join(', ')} WHERE id = ?`;
    return this.run(sql, values);
  }

  async getBatchJob (id) {
    const row = await this.get('SELECT * FROM batch_jobs WHERE id = ?', [id]);
    if (row) {
      row.settings = row.settings ? JSON.parse(row.settings) : null;
    }
    return row;
  }

  async addBatchItem (item) {
    const sql = `
      INSERT INTO batch_items (
        id, batch_id, original_name, original_path, original_size, client_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      item.id || Date.now().toString(),
      item.batchId,
      item.originalName,
      item.originalPath,
      item.originalSize,
      item.clientId || null,
    ];
    return this.run(sql, params);
  }

  async updateBatchItem (id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    values.push(id);
    const sql = `UPDATE batch_items SET ${fields.join(', ')} WHERE id = ?`;
    return this.run(sql, values);
  }

  async getBatchItems (batchId) {
    return this.all('SELECT * FROM batch_items WHERE batch_id = ?', [batchId]);
  }

  async close () {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

// Singleton instance
const databaseService = new DatabaseService();

module.exports = {
  databaseService,
  initializeDatabase: () => databaseService.initialize(),
};
