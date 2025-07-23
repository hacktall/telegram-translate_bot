
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import translate from '@vitalets/google-translate-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gTTS from 'gtts';
import handleDesafioDoDia from './educacional/desafios.js';
import handleQuiz from './educacional/quiz.js';
import handleDefinicao from './educacional/definiçao.js';



dotenv.config({ path: './settings/.env' });

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log('🤖 Translation Bot iniciado...');
// Importe os módulos APÓS o `bot` estar definido


// Use os módulos
handleDesafioDoDia(bot);
handleQuiz(bot);


bot.onText(/^\/def (.+)/, (msg, match) => {
  handleDefinicao(bot, msg, match);
});


const userLangs = {}; // Preferência de idioma por usuário

// Idiomas disponíveis
const languages = {
  en: 'Inglês',
  pt: 'Português',
  es: 'Espanhol',
  fr: 'Francês',
  de: 'Alemão',
  it: 'Italiano',
  ja: 'Japonês',
  ru: 'Russo',
};

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  let langList = 'Escolha o idioma de destino com /lang ou diretamente com o código:\n\n';

  for (const [code, name] of Object.entries(languages)) {
    langList += `/${code} - ${name}\n`;
  }

  bot.sendMessage(chatId, langList);
});

// Definir idioma com /<codigo>
bot.onText(/^\/([a-z]{2})$/, (msg, match) => {
  const chatId = msg.chat.id;
  const lang = match[1];

  if (languages[lang]) {
    userLangs[chatId] = lang;
    bot.sendMessage(chatId, `✅ Idioma definido para ${languages[lang]}`);
  } else {
    bot.sendMessage(chatId, '❌ Código de idioma inválido.');
  }
});

// Processar mensagens de texto
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const targetLang = userLangs[chatId] || 'en';

  if (text.length < 2 || text.match(/https?:\/\//)) {
    return; // Ignora links ou mensagens muito curtas
  }

  try {
    const res = await translate(text, { to: targetLang });

    bot.sendMessage(chatId, `🗣 Detectado: ${res.from.language.iso.toUpperCase()}
📝 Original: ${text}
🔁 Traduzido: ${res.text}`);

    // Texto para voz
    const gtts = new gTTS(res.text, targetLang);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audioPath = path.join(__dirname, 'translation.mp3');

    gtts.save(audioPath, function (err) {
      if (err) {
        console.error('Erro ao gerar áudio:', err);
        bot.sendMessage(chatId, '⚠️ Tradução OK, mas houve erro ao gerar o áudio.');
        return;
      }

      bot.sendAudio(chatId, audioPath, {
        title: `Tradução em ${targetLang.toUpperCase()}`
      }).then(() => {
        fs.unlinkSync(audioPath); // remove o arquivo após envio
      });
    });

  } catch (err) {
    console.error('Erro na tradução:', err.message);
    bot.sendMessage(chatId, '⚠️ Erro ao traduzir. Tente novamente.');
  }
});
