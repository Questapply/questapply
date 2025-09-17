// ESM
export async function ensurePaymentsTables(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS qacom_payments (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      intent VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64) NULL,
      resource_id BIGINT NULL,
      credits INT NULL,
      amount_minor BIGINT NOT NULL,
      currency VARCHAR(8) NOT NULL,
      provider VARCHAR(32) NOT NULL,
      provider_order_id VARCHAR(128) NULL,
      provider_session_id VARCHAR(128) NULL,
      status ENUM('pending','succeeded','failed') NOT NULL DEFAULT 'pending',
      txn_id VARCHAR(128) NULL,
      return_url TEXT NULL,
      cancel_url TEXT NULL,
      meta_json LONGTEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_provider_order (provider_order_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // افزودن ستون paid اگر نبود
  const [cols] = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'qacom_psu_submissions' AND column_name = 'paid'
  `);
  if (!cols.length) {
    await db.query(
      `ALTER TABLE qacom_psu_submissions ADD COLUMN paid TINYINT(1) NOT NULL DEFAULT 0`
    );
  }
}
