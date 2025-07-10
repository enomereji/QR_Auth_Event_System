const express = require('express');
const fs = require ('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');


const app = express()
const PORT = process.env.PORT || 3000;
const tokenFile = path.join(__dirname, 'tokens.json');
const qrDir = path.join(__dirname, 'qrcodes');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);

// Load token list
let tokens = fs.existsSync(tokenFile)
    ? JSON.parse(fs.readFileSync(tokenFile))
    : [];

// Generate QR codes with unique tokens
function generateTokens(count) {
    tokens = [];
    const PUBLIC_URL = 'https://qr-auth-event-system.onrender.com/'

    for (let i = 1; i <= count; i++) {
        const token = uuidv4();
        const url = `${PUBLIC_URL}/verify/${token}`;
        const filename = `qr_${i}.png`;

        tokens.push({ id: i, token, used: false });

        QRCode.toFile(path.join(qrDir, filename), url);
    }
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
}

// One-time generation ()
// generateTokens(500);

//Verify route

app.get('/', (req, res) => {
    res.redirect('/scanner.html')
});


app.get('/verify/:token', (req, res) => {
    const entry = tokens.find(t => t.token === req.params.token);
    if (!entry) return res.send('Invalid QR Code');
    
    res.send('Access Granted. Welcome to Mrs Utis 80th!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});
