import gTTS from 'gtts';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handleDesafioDoDia(bot) {
  bot.onText(/\/desafio/, (msg) => {
    const chatId = msg.chat.id;

    const frases = [
      { texto: 'Good morning', traducao: 'Bom dia', lang: 'en' },
      { texto: 'How are you?', traducao: 'Como você está?', lang: 'en' },
      { texto: 'I like programming', traducao: 'Eu gosto de programar', lang: 'en' },
    ];

    const item = frases[Math.floor(Math.random() * frases.length)];

    const audioPath = path.join(__dirname, 'audio.mp3');
    const gtts = new gTTS(item.texto, item.lang);

    gtts.save(audioPath, function (err) {
      if (err) {
        bot.sendMessage(chatId, 'Erro ao gerar áudio.');
        return;
      }

      bot.sendMessage(chatId, `📌 *Desafio do Dia:*\n📝 ${item.texto}\n🔁 ${item.traducao}`, { parse_mode: 'Markdown' });
      bot.sendAudio(chatId, audioPath).then(() => {
        fs.unlink(audioPath, () => {});
      });
    });
  });
}
