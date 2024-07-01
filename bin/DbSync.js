import 'dotenv/config';
import koneksi from'../config/connection.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ora from 'ora';
// import model_fd from '../modules/freshdesk/model.js'
try {
    // console.log(cliSpinners.dots);
    const spinner = ora('Sync DImulai...').start();
    spinner.color = 'yellow';
    const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
let normalizedPath = path.join(__dirname, "../modules");
// console.log(normalizedPath);
let folder1 = fs.readdirSync(normalizedPath)
for (let u = 0; u < folder1.length; u++) {
    let normalize = path.join(__dirname, "../modules/" + folder1[u]);
    let folder2 =  fs.readdirSync(normalize)
    for (let i = 0; i < folder2.length; i++) {
        if (folder2[i] == "model.js") {
            let m=  await  import(`../modules/${folder1[u]}/model.js`)
             }
    }
    
}
   
    await koneksi.sync({ alter: true })
    spinner.color = 'green';
    spinner.text = 'sync Berhasil';
    spinner.succeed();
    // console.log('sync was successful')
    console.log('disconnecting...')
    process.exit(0);
} catch (error) {
    console.log(error)
}