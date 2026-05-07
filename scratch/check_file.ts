import { fileTypeFromFile } from 'file-type';
import fs from 'fs';

async function main() {
  const filePath = 'public/dailydocket.png';
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`File: ${filePath}`);
    console.log(`Size: ${stats.size} bytes`);
    
    const type = await fileTypeFromFile(filePath);
    console.log(`Type: ${JSON.stringify(type)}`);
  } else {
    console.log(`File NOT found: ${filePath}`);
  }
}

main();
