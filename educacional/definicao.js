import translate from '@vitalets/google-translate-api';
import axios from 'axios';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map();

function escapeMarkdownV2(text = '') {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, String.raw`\$1`);
}


function isValidWord(word) {
  if (!word) return false;
  if (word.length > 30) return false;
  return /^[\p{L}\-']+$/u.test(word);
}
function checkRateLimit(chatId) {
  const now = Date.now();
  const arr = rateLimitMap.get(chatId) || [];
  const filtered = arr.filter(ts => now - ts <= RATE_LIMIT_WINDOW_MS);
  filtered.push(now);
  rateLimitMap.set(chatId, filtered);
  return filtered.length <= RATE_LIMIT_MAX;
}

export default async function handleDefinicao(bot, msg, match) {
  if (!msg || !msg.chat) {
    bot.onText(/^\/def (.+)/, (m, mt) => {
      handleDefinicao(bot, m, mt).catch(err =>
        console.error('[definicao] erro handler:', err?.message || err)
      );
    });
    return;
  }

  const chatId = msg.chat.id;
  let raw = match?.[1]?.trim() || '';
if (raw.startsWith('/')) {
  raw = raw.slice(1); // remove barra inicial
}

  if (!checkRateLimit(chatId)) {
    return bot.sendMessage(chatId, '⏳ Muitas requisições. Tente novamente em breve.');
  }
  if (!raw) {
    return bot.sendMessage(chatId, '❗️ Use /def <palavra> para obter definição.');
  }
  if (!isValidWord(raw)) {
    return bot.sendMessage(chatId, '❗️ Palavra inválida. Use apenas letras (máx 30 caracteres).');
  }

  const word = raw.toLowerCase();

  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { timeout: 5000 }
    );
    const entry = Array.isArray(res.data) ? res.data[0] : null;
    if (!entry) {
      return bot.sendMessage(chatId, '❌ Não foi possível encontrar essa palavra.');
    }

    const meaning = entry.meanings?.[0]?.definitions?.[0]?.definition || 'Sem definição encontrada.';
    const example = entry.meanings?.[0]?.definitions?.[0]?.example || 'Sem exemplo.';
    const phonetic = entry.phonetic || '';
    const partOfSpeech = entry.meanings?.[0]?.partOfSpeech || '';

    const translated = await translate(meaning, { to: 'pt' });

    // Escape de TODOS os campos
    const wordEsc = escapeMarkdownV2(word);
    const posEsc = escapeMarkdownV2(partOfSpeech);
    const phoneticEsc = escapeMarkdownV2(phonetic);
    const meaningEsc = escapeMarkdownV2(meaning);
    const exampleEsc = escapeMarkdownV2(example);
    const translatedEsc = escapeMarkdownV2(translated.text);

    const message = [
      `📖 Palavra: *${wordEsc}* \\(${posEsc}\\)`,
      `🔈 Fonética: _${phoneticEsc}_`,
      `🧠 Definição (EN): ${meaningEsc}`,
      `🗣 Exemplo: "${exampleEsc}"`,
      `🌐 Tradução (PT): ${translatedEsc}`
    ].join('\n');


   await bot.sendMessage(chatId, `
📖 Palavra: <b>${word}</b> (${posEsc})\n
🔈 Fonética: <i>${phonetic}</i>\n
🧠 Definição (EN): ${meaning}\n
🗣 Exemplo: "${example}"\n
🌐 Tradução (PT): ${translated.text}
`, { parse_mode: 'HTML' });

  } catch (err) {
    console.error('[definicao] erro:', err?.message || err);
    bot.sendMessage(chatId, '❌ Não foi possível obter a definição no momento. Tente novamente mais tarde.');
  }
}
