import { panelOptions } from "./panelOptions.js";
import { configDotenv } from "dotenv";

let env = configDotenv().parsed;

let errors = 0;
let dotenvErrors = 0;

if (!panelOptions.length > 0) {
  errors++;
  console.error(`Missing option in panelOptions`);
}

panelOptions.forEach((option) => {
  if (!option.description) {
    errors++;
    console.error(`Missing description field for option:`, option);
  }
  if (option.disabled === undefined) {
    errors++;
    console.error(`Missing disabled field for option:`, option);
  }
  if (!option.emoji) {
    errors++;
    console.error(`Missing emoji field for option:`, option);
  }
  if (!option.name) {
    errors++;
    console.error(`Missing name field for option:`, option);
  }
  if (!option.smallName) {
    errors++;
    console.error(`Missing smallName field for option:`, option);
  }
});

if (!env.TOKEN) {
  dotenvErrors++;
  console.error(`Missing TOKEN environment variable`);
}
if (!env.PREFIX) {
  dotenvErrors++;
  console.error(`Missing PREFIX environment variable`);
}
if (!env.OWNER) {
  dotenvErrors++;
  console.error(`Missing OWNER environment variable`);
}
if (!env.TICKET_CATEGORY) {
  dotenvErrors++;
  console.error(`Missing TICKET_CATEGORY environment variable`);
}
if (!env.STAFF_ROLE) {
  dotenvErrors++;
  console.error(`Missing STAFF_ROLE environment variable`);
}
if (!env.LOGS_CHANNEL) {
  dotenvErrors++;
  console.error(`Missing LOGS_CHANNEL environment variable`);
}

console.log(`There were ${errors + dotenvErrors} errors during configuration validation:
- panelOptions.js: ${errors} errors
- .env: ${dotenvErrors} errors`);
