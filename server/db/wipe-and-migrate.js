require('dotenv').config();
const { Pool } = require('pg');
const { getDb } = require('./init'); // Using the legacy init.js to read the SQLite file

// Ensure PostgreSQL connection string is provided
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
    CREATE TABLE IF NOT EXISTS entities (
      id SERIAL PRIMARY KEY,
      uen VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      contact_number VARCHAR(255),
      website VARCHAR(255),
      email_domains TEXT,
      logo_url TEXT,
      performance_multiplier NUMERIC DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        entity_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS site_working_hours (
        id SERIAL PRIMARY KEY,
        site_id INTEGER NOT NULL,
        shift_type TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT,
        end_time TEXT,
        meal_start_time TEXT,
        meal_end_time TEXT,
        ot_start_time TEXT,
        compulsory_ot_hours REAL DEFAULT 0,
        ot_meal_start_time TEXT,
        ot_meal_end_time TEXT,
        late_arrival_threshold_mins INTEGER DEFAULT 0,
        early_departure_threshold_mins INTEGER DEFAULT 0,
        late_arrival_penalty_block_mins INTEGER DEFAULT 0,
        early_departure_penalty_block_mins INTEGER DEFAULT 0,
        performance_multiplier REAL DEFAULT 1.0
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_entity_roles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      role VARCHAR(255) DEFAULT 'HR',
      managed_groups TEXT DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, name)
    );

    CREATE TABLE IF NOT EXISTS employee_groups (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, name)
    );

    CREATE TABLE IF NOT EXISTS employee_grades (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, name)
    );

    CREATE TABLE IF NOT EXISTS email_domains (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      domain VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, domain)
    );

    CREATE TABLE IF NOT EXISTS holidays (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, name, date)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_id VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      date_of_birth DATE,
      national_id VARCHAR(255),
      nationality VARCHAR(255) DEFAULT 'Singapore Citizen',
      tax_residency VARCHAR(255) DEFAULT 'Resident',
      race VARCHAR(255),
      designation VARCHAR(255),
      department VARCHAR(255),
      employee_group VARCHAR(255),
      employee_grade VARCHAR(255) DEFAULT '',
      gender VARCHAR(50),
      language VARCHAR(50),
      mobile_number VARCHAR(255),
      whatsapp_number VARCHAR(255),
      email VARCHAR(255),
      highest_education VARCHAR(255),
      date_joined DATE,
      cessation_date DATE,
      basic_salary NUMERIC,
      transport_allowance NUMERIC,
      meal_allowance NUMERIC,
      other_allowance NUMERIC,
      other_deduction NUMERIC DEFAULT 0,
      custom_allowances TEXT DEFAULT '{}',
      custom_deductions TEXT DEFAULT '{}',
      payment_mode VARCHAR(255) DEFAULT 'Bank Transfer',
      bank_name VARCHAR(255),
      bank_account VARCHAR(255),
      cpf_applicable BOOLEAN DEFAULT true,
      pr_status_start_date DATE,
      cpf_full_rate_agreed BOOLEAN DEFAULT false,
      working_days_per_week NUMERIC DEFAULT 5.5,
      rest_day VARCHAR(50) DEFAULT 'Sunday',
      working_hours_per_day NUMERIC DEFAULT 8,
      working_hours_per_week NUMERIC DEFAULT 44,
      site_id INTEGER,
      photo_url TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      face_descriptor TEXT,
      work_pass_type VARCHAR(255),
      work_pass_expiry DATE,
      work_pass_no VARCHAR(255),
      work_pass_start_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS employee_documents (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      document_type VARCHAR(255) NOT NULL,
      document_number VARCHAR(255) NOT NULL,
      issue_date DATE,
      expiry_date DATE,
      file_path TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_kets (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      job_title VARCHAR(255),
      employment_start_date DATE,
      employment_type VARCHAR(255) DEFAULT 'Permanent',
      contract_duration VARCHAR(255),
      working_hours_per_day NUMERIC DEFAULT 8,
      working_days_per_week INTEGER DEFAULT 5,
      rest_day VARCHAR(50) DEFAULT 'Sunday',
      salary_period VARCHAR(255) DEFAULT 'Monthly',
      basic_salary NUMERIC DEFAULT 0,
      fixed_allowances TEXT DEFAULT '{}',
      fixed_deductions TEXT DEFAULT '{}',
      custom_allowances TEXT DEFAULT '{}',
      custom_deductions TEXT DEFAULT '{}',
      employee_grade VARCHAR(255) DEFAULT '',
      overtime_rate NUMERIC DEFAULT 0,
      overtime_payment_period VARCHAR(255),
      bonus_structure TEXT,
      annual_leave_days INTEGER DEFAULT 7,
      sick_leave_days INTEGER DEFAULT 14,
      hospitalization_days INTEGER DEFAULT 60,
      maternity_weeks INTEGER DEFAULT 16,
      paternity_weeks INTEGER DEFAULT 2,
      childcare_days INTEGER DEFAULT 6,
      medical_benefits TEXT,
      probation_months INTEGER DEFAULT 3,
      notice_period VARCHAR(255) DEFAULT '1 month',
      place_of_work TEXT,
      main_duties TEXT,
      employment_end_date DATE,
      working_hours_details TEXT,
      break_hours TEXT,
      salary_payment_date VARCHAR(255),
      overtime_payment_date VARCHAR(255),
      gross_rate_of_pay NUMERIC,
      other_salary_components TEXT,
      cpf_payable BOOLEAN DEFAULT true,
      probation_start_date DATE,
      probation_end_date DATE,
      issued_date DATE,
      job_title_tr TEXT,
      main_duties_tr TEXT,
      medical_benefits_tr TEXT,
      notice_period_tr TEXT,
      other_salary_components_tr TEXT,
      target_language TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leave_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      default_days NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_policies (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_grade VARCHAR(255) NOT NULL,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
      base_days NUMERIC DEFAULT 0,
      increment_per_year NUMERIC DEFAULT 0,
      max_days NUMERIC DEFAULT 0,
      carry_forward_max NUMERIC DEFAULT 0,
      carry_forward_expiry_months INTEGER DEFAULT 12,
      encashment_allowed BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, employee_grade, leave_type_id)
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      entitled NUMERIC DEFAULT 0,
      carried_forward NUMERIC DEFAULT 0,
      taken NUMERIC DEFAULT 0,
      balance NUMERIC DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days NUMERIC NOT NULL,
      reason TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payroll_runs (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_group VARCHAR(255) NOT NULL,
      period_year INTEGER NOT NULL,
      period_month INTEGER NOT NULL,
      run_date DATE NOT NULL,
      payment_date DATE,
      total_gross NUMERIC DEFAULT 0,
      total_cpf_employee NUMERIC DEFAULT 0,
      total_cpf_employer NUMERIC DEFAULT 0,
      total_sdl NUMERIC DEFAULT 0,
      total_shg NUMERIC DEFAULT 0,
      total_net NUMERIC DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Draft',
      is_locked INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payslips (
      id SERIAL PRIMARY KEY,
      payroll_run_id INTEGER NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      employee_name VARCHAR(255),
      employee_code VARCHAR(255),
      basic_salary NUMERIC DEFAULT 0,
      transport_allowance NUMERIC DEFAULT 0,
      meal_allowance NUMERIC DEFAULT 0,
      other_allowance NUMERIC DEFAULT 0,
      total_allowances NUMERIC DEFAULT 0,
      overtime_hours NUMERIC DEFAULT 0,
      overtime_pay NUMERIC DEFAULT 0,
      ot_1_5_hours NUMERIC DEFAULT 0,
      ot_2_0_hours NUMERIC DEFAULT 0,
      ot_1_5_pay NUMERIC DEFAULT 0,
      ot_2_0_pay NUMERIC DEFAULT 0,
      ph_worked_pay NUMERIC DEFAULT 0,
      ph_off_day_pay NUMERIC DEFAULT 0,
      bonus NUMERIC DEFAULT 0,
      custom_allowances TEXT DEFAULT '{}',
      custom_deductions TEXT DEFAULT '{}',
      payment_mode VARCHAR(255) DEFAULT 'Bank Transfer',
      gross_pay NUMERIC DEFAULT 0,
      cpf_employee NUMERIC DEFAULT 0,
      cpf_employer NUMERIC DEFAULT 0,
      cpf_oa NUMERIC DEFAULT 0,
      cpf_sa NUMERIC DEFAULT 0,
      cpf_ma NUMERIC DEFAULT 0,
      sdl NUMERIC DEFAULT 0,
      shg_deduction NUMERIC DEFAULT 0,
      shg_fund VARCHAR(255),
      other_deductions NUMERIC DEFAULT 0,
      unpaid_leave_days NUMERIC DEFAULT 0,
      unpaid_leave_deduction NUMERIC DEFAULT 0,
      late_mins INTEGER DEFAULT 0,
      early_out_mins INTEGER DEFAULT 0,
      attendance_deduction NUMERIC DEFAULT 0,
      performance_allowance NUMERIC DEFAULT 0,
      ns_makeup_pay NUMERIC DEFAULT 0,
      ns_days NUMERIC DEFAULT 0,
      net_pay NUMERIC DEFAULT 0,
      compliance_notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timesheets (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      in_time VARCHAR(255),
      out_time VARCHAR(255),
      shift VARCHAR(255),
      ot_hours NUMERIC DEFAULT 0,
      ot_1_5_hours NUMERIC DEFAULT 0,
      ot_2_0_hours NUMERIC DEFAULT 0,
      late_mins INTEGER DEFAULT 0,
      early_out_mins INTEGER DEFAULT 0,
      performance_credit NUMERIC DEFAULT 0,
      normal_hours NUMERIC DEFAULT 0,
      ph_hours NUMERIC DEFAULT 0,
      remarks TEXT,
      source_file TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS attendance_remarks (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      remark_type VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS submission_logs (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username VARCHAR(255),
      submission_type VARCHAR(255) NOT NULL,
      file_type VARCHAR(255),
      acknowledgment_no VARCHAR(255),
      records_count INTEGER DEFAULT 0,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS iras_forms (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      year_of_assessment INTEGER,
      form_type TEXT,
      is_amendment BOOLEAN DEFAULT false,
      amendment_reason TEXT,
      form_data TEXT,
      year INTEGER,
      data_json TEXT,
      status VARCHAR(50) DEFAULT 'Generated',
      version INTEGER DEFAULT 1,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_locked BOOLEAN DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS iras_benefits_in_kind (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      category VARCHAR(255) NOT NULL,
      description TEXT,
      value NUMERIC DEFAULT 0,
      period_from DATE,
      period_to DATE
    );

    CREATE TABLE IF NOT EXISTS iras_submissions (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      submission_id VARCHAR(255) UNIQUE,
      year INTEGER NOT NULL,
      type VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      payload_json TEXT,
      response_json TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ns_claims (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days INTEGER NOT NULL,
      claim_amount NUMERIC,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS iras_share_options (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      plan_type VARCHAR(255),
      grant_date DATE,
      exercise_date DATE,
      exercise_price NUMERIC,
      market_value NUMERIC,
      shares_count INTEGER,
      taxable_profit NUMERIC
    );

    CREATE TABLE IF NOT EXISTS shift_settings (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      shift_name VARCHAR(255) NOT NULL,
      start_time VARCHAR(255) DEFAULT '08:00',
      end_time VARCHAR(255) DEFAULT '17:00',
      ot_start_time VARCHAR(255) DEFAULT '17:30',
      late_arrival_threshold_mins INTEGER DEFAULT 15,
      early_departure_threshold_mins INTEGER DEFAULT 15,
      late_arrival_penalty_block_mins INTEGER DEFAULT 0,
      early_departure_penalty_block_mins INTEGER DEFAULT 0,
      compulsory_ot_hours NUMERIC DEFAULT 0,
      lunch_break_mins INTEGER DEFAULT 60,
      dinner_break_mins INTEGER DEFAULT 0,
      midnight_break_mins INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, shift_name)
    );
`;

const tablesToMigrate = [
  'entities', 'users', 'user_entity_roles', 'customers', 'sites', 'site_working_hours',
  'departments', 'employee_groups',
  'employee_grades', 'email_domains', 'holidays', 'employees',
  'employee_documents', 'employee_kets', 'leave_types', 'leave_policies',
  'leave_balances', 'leave_requests', 'payroll_runs', 'payslips', 'user_roles',
  'shift_settings', 'timesheets', 'attendance_remarks', 'submission_logs',
  'iras_forms', 'iras_benefits_in_kind', 'iras_submissions', 'ns_claims',
  'iras_share_options'
];

async function migrateData() {
  console.log("🔥 Dropping existing schema to wipe all old Postgres Data...");
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  console.log("🚀 Starting fresh PostgreSQL schema creation...");
  await pool.query(schema);
  console.log("✅ Schema created successfully.");

  console.log("📦 Loading data from local SQLite database (hrms-db.sqlite)...");
  const sqliteDb = await getDb();

  for (const table of tablesToMigrate) {
    console.log(`\n➡️ Migrating table: ${table}...`);

    try {
      const result = sqliteDb.exec(`SELECT * FROM ${table}`);
      if (result.length === 0) {
        console.log(`   Table ${table} is empty. Skipping.`);
        continue;
      }

      const columns = result[0].columns;
      const rows = result[0].values;

      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const insertQuery = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let rowCount = 0;
      let failedCount = 0;
      try {
        const batchSize = 10; // Batch size matching max pool connections
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          await Promise.all(batch.map(async (row) => {
            const transformedRow = row.map((val, idx) => {
              const colName = columns[idx];
              if (['cpf_applicable', 'cpf_full_rate_agreed', 'cpf_payable', 'encashment_allowed', 'is_amendment'].includes(colName)) {
                return val === 1 || val === true || val === '1' || val === 'true';
              }
              if (colName === 'is_locked') {
                return (val === 'true' || val === 1 || val === true) ? 1 : 0;
              }
              if (val && /^\d{5}$/.test(val.toString()) && (colName.includes('date') || colName.includes('dob') || colName.includes('expiry'))) {
                const dateVal = new Date((parseInt(val) - 25569) * 86400 * 1000);
                return dateVal.toISOString().split('T')[0];
              }
              if (val === '') {
              }
              return val;
            });

            try {
              await pool.query(insertQuery, transformedRow);
              rowCount++;
            } catch (e) {
              failedCount++;
              if (failedCount <= 2) {
                console.error(`      ⚠️ Row error (${table}): ${e.message}`);
              }
            }
          }));
        }

        if (columns.includes('id')) {
          await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM ${table};`);
        }

        console.log(`   ✅ Migrated ${rowCount} rows for ${table}.${failedCount > 0 ? ` (Skipped ${failedCount} rows with errors)` : ''}`);
      } catch (innerErr) {
        console.error(`      ⚠️ Critical Error mapping rows (${table}): ${innerErr.message}`);
      }
    } catch (err) {
      console.error(`   ⚠️ Could not read ${table} from SQLite: ${err.message}`);
    }
  }

  console.log("\\n🎉 Migration completed successfully.");
}

migrateData().then(() => {
  process.exit(0);
}).catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
