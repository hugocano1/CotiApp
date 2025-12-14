const fs = require('fs');
const path = require('path');

if (process.env.GOOGLE_SERVICES_JSON_BASE64) {
  try {
    const fileContent = Buffer.from(process.env.GOOGLE_SERVICES_JSON_BASE64, 'base64');
    const filePath = path.join(process.cwd(), 'google-services.json');
    fs.writeFileSync(filePath, fileContent);
  } catch (error) {
    console.error('Failed to decode or write google-services.json:', error);
    process.exit(1);
  }
} else {
  console.error('Error: GOOGLE_SERVICES_JSON_BASE64 environment variable is required for this build but was not set.');
  process.exit(1);
}
