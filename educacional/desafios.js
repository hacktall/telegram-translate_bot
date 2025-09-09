// desafios.js
import gTTS from 'gtts';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import os from 'os';
import { randomUUID } from 'crypto';

const inProgress = new Set(); // chatId em geração de áudio

function escapeMarkdownV2(text = '') {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export default function handleDesafioDoDia(bot) {
  // O handler registra o comando /desafio
  bot.onText(/\/desafio(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (inProgress.has(chatId)) {
      bot.sendMessage(chatId, '⏳ Já estou gerando um desafio para você — aguarde um momento.');
      return;
    }

    inProgress.add(chatId);

    const frases = [
      { texto: 'Good morning', traducao: 'Bom dia', lang: 'en' },
      { texto: 'How are you?', traducao: 'Como você está?', lang: 'en' },
      { texto: 'I like programming', traducao: 'Eu gosto de programar', lang: 'en' },
    ];

    const item = frases[Math.floor(Math.random() * frases.length)];

    // arquivo temporário único no tmp do sistema
    const tmpDir = os.tmpdir();
    const filename = `audio_${chatId}_${Date.now()}_${randomUUID()}.mp3`;
    const audioPath = path.join(tmpDir, filename);

    let sent = false;

    try {
      await new Promise((resolve, reject) => {
        const gtts = new gTTS(item.texto, item.lang);

        gtts.save(audioPath, function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      // Envia texto (escape)
      const textMessage = `📌 *Desafio do Dia:*\n📝 ${escapeMarkdownV2(item.texto)}\n🔁 ${escapeMarkdownV2(item.traducao)}`;
      await bot.sendMessage(chatId, textMessage, { parse_mode: 'MarkdownV2' });

      // Envia áudio (stream do arquivo temporário)
      await bot.sendAudio(chatId, audioPath);
      sent = true;
    } catch (err) {
      console.error('[desafio] erro ao gerar/enviar áudio:', err?.message || err);
      bot.sendMessage(chatId, '❌ Erro ao gerar o áudio do desafio. Tente novamente mais tarde.');
    } finally {
      // limpeza do arquivo temporário (garantida)
      try {
        await fs.unlink(audioPath).catch(() => {});
      } catch (e) {
        // já tentamos; log apenas em debug
        console.warn('[desafio] falha ao remover arquivo tmp:', audioPath, e?.message || e);
      }
      inProgress.delete(chatId);
    }
  });
}
