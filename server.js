
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());
app.use(express.static(__dirname));

async function sendWhatsAppMessage(text) {
  try {
    await fetch(`https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${MY_PHONE_NUMBER}@c.us`,
        message: text
      })
    });
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

app.get('/', (req, res) => {
  sendWhatsAppMessage('مرحباً! تم فتح الموقع الخاص بك بنجاح.');
  res.send('<h1>الموقع يعمل بنجاح!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
