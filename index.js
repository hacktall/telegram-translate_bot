import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import translate from '@vitalets/google-translate-api';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { randomUUID } from 'crypto';
import gTTS from 'gtts';

import handleDesafioDoDia from './educacional/desafios.js';
import handleQuiz from './educacional/quiz.js';
import handleDefinicao from './educacional/definicao.js';

dotenv.config({ path: './settings/.env' });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ Faltando TELEGRAM_BOT_TOKEN no .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
console.log('🤖 Translation Bot iniciado com segurança.');

// === Rate limiting básico para traduções ===
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 15;
const rateLimitMap = new Map();

function checkRateLimit(chatId) {
  const now = Date.now();
  const arr = rateLimitMap.get(chatId) || [];
  const filtered = arr.filter(ts => now - ts <= RATE_LIMIT_WINDOW_MS);
  filtered.push(now);
  rateLimitMap.set(chatId, filtered);
  return filtered.length <= RATE_LIMIT_MAX;
}

// === Escape Markdown ===
function escapeMarkdownV2(text = '') {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// === Locks para geração de áudio ===
const audioInProgress = new Set();

// === Registra módulos educacionais ===
handleDesafioDoDia(bot);
handleQuiz(bot);

bot.onText(/^\/def (.+)/, (msg, match) => {
  handleDefinicao(bot, msg, match);
});

// Idiomas suportados
const userLangs = {}; // Preferência de idioma por usuário
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

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  let langList = 'Escolha o idioma de destino:\n\n';

  for (const [code, name] of Object.entries(languages)) {
    langList += `/${code} - ${name}\n`;
  }

  bot.sendMessage(chatId, langList);
});

// /<codigo>
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

// Traduções de mensagens comuns
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  // Proteções básicas
  if (!checkRateLimit(chatId)) {
    bot.sendMessage(chatId, '⏳ Muitas requisições, aguarde um pouco.');
    return;
  }
  if (text.length < 2 || text.length > 200 || text.match(/https?:\/\//)) {
    return; // ignora mensagens suspeitas ou muito longas
  }

  const targetLang = userLangs[chatId] || 'en';

  try {
    const res = await translate(text, { to: targetLang });

   const detectedEsc = escapeMarkdownV2(String(res.from.language.iso || '').toUpperCase());
const originalEsc = escapeMarkdownV2(text || '');
const translatedEsc = escapeMarkdownV2(res.text || '');

const msg = `🗣 Detectado: ${detectedEsc}\n📝 Original: ${originalEsc}\n🔁 Traduzido: ${translatedEsc}`;

bot.sendMessage(chatId, msg, { parse_mode: 'MarkdownV2' })
  .catch(err => {
    console.error('[index] sendMessage erro:', err?.response?.body || err);
  });

    if (audioInProgress.has(chatId)) return;
    audioInProgress.add(chatId);

    const tmpDir = os.tmpdir();
    const filename = `translation_${chatId}_${Date.now()}_${randomUUID()}.mp3`;
    const audioPath = path.join(tmpDir, filename);

    await new Promise((resolve, reject) => {
      const gtts = new gTTS(res.text, targetLang);
      gtts.save(audioPath, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    await bot.sendAudio(chatId, audioPath, {
      title: `Tradução em ${targetLang.toUpperCase()}`
    });

    await fs.unlink(audioPath).catch(() => {});
  } catch (err) {
    console.error('[tradução] erro:', err?.message || err);
    bot.sendMessage(chatId, '⚠️ Erro ao traduzir. Tente novamente.');
  } finally {
    audioInProgress.delete(chatId);
  }
});

// Tratamento de erros globais
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // deixe PM2/systemd reiniciar o processo
});
