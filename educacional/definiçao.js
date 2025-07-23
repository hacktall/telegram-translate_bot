import translate from '@vitalets/google-translate-api';
import axios from 'axios';

export default async function handleDefinicao(bot, msg, match) {
  const chatId = msg.chat.id;
  const word = match[1]?.trim();

  if (!word) {
    bot.sendMessage(chatId, '❗️ Use /def <palavra> para obter definição.');
    return;
  }

  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const entry = res.data[0];
    const meaning = entry.meanings[0]?.definitions[0]?.definition || 'Sem definição encontrada.';
    const example = entry.meanings[0]?.definitions[0]?.example || 'Sem exemplo.';
    const phonetic = entry.phonetic || '';
    const partOfSpeech = entry.meanings[0]?.partOfSpeech || '';

    const translated = await translate(meaning, { to: 'pt' });

    const message = `
📖 Palavra: *${word}* (${partOfSpeech})
🔈 Fonética: _${phonetic}_
🧠 Definição (EN): ${meaning}
🗣 Exemplo: "${example}"
🌐 Tradução (PT): ${translated.text}
`.trim();

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Erro ao buscar definição:', err.message);
    bot.sendMessage(chatId, '❌ Não foi possível encontrar essa palavra.');
  }
}