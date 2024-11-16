import { Sequelize } from "sequelize";
import path from 'path'
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url));
import dotenv from 'dotenv'
dotenv.config({
  path: path.join(__dirname, "../../", ".env"),
});

// here I have used postgress database using sequelize

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, "../../", "ca.pem")).toString(),
      }
    }
  }
);

try {
  await sequelize.authenticate();
  console.log('Connected to database')
} catch(error) {
  console.log(`Unable to connect to database ${error}`);
}

export default sequelize;