import express from 'express';
import path from 'path/win32';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index');
});


const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const hostname = externalUrl ? '0.0.0.0' : '127.0.0.1';

app.listen(port, hostname, () => {
    console.log(`Server je pokrenut na http://${hostname}:${port}`);
    if (externalUrl) console.log(`Vanjska URL adresa: ${externalUrl}`);
})