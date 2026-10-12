const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

/**
 * Automated and On-Demand Database Backup Service
 * Creates structured SQL dump backups into database/backups/
 */
class BackupService {
  static async performBackup() {
    try {
      const backupDir = path.join(__dirname, '../../database/backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_electricity_forecasting_${timestamp}.sql`;
      const filePath = path.join(backupDir, filename);

      const [tables] = await pool.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);

      let sqlDump = `-- Electricity Forecasting Database Backup\n-- Generated At: ${new Date().toISOString()}\n\n`;
      sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      for (const table of tableNames) {
        // 1. Structure
        const [[createResult]] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
        const createSql = createResult['Create Table'];
        sqlDump += `-- Table: ${table}\nDROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n\n`;

        // 2. Data
        const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
        if (rows.length > 0) {
          const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
          const valuesList = rows.map(r => {
            const vals = Object.values(r).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'number') return val;
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "\\'")}'`;
              return `'${String(val).replace(/'/g, "\\'")}'`;
            });
            return `(${vals.join(', ')})`;
          });

          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES\n${valuesList.join(',\n')};\n\n`;
        }
      }

      sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
      fs.writeFileSync(filePath, sqlDump, 'utf8');

      console.log(`[Backup] Database backup completed successfully: ${filename}`);
      return { success: true, filename, filePath, timestamp };
    } catch (error) {
      console.error('[Backup Error] Failed to create database backup:', error.message);
      throw error;
    }
  }
}

// Allow CLI execution: `node backend/services/backupService.js`
if (require.main === module) {
  BackupService.performBackup().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = BackupService;
