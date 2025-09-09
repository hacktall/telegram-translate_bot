// quiz.js
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'quiz_state.json'); // persiste em file (opcional)
const rateLimitMap = new Map(); // chatId -> [timestamps]
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30; // mensagens por minuto (ajustar)

const MAX_ATTEMPTS_PER_QUESTION = 3;
function escapeMarkdownV2(text = '') {
  // escapa apenas os caracteres realmente reservados pelo MarkdownV2
  return String(text).replace(/([_*\[\]()~`>#+\-=|{}!])/g, '\\$1');
}

const quizzes = {
  pt: {
    medio: [
      { en: 'Chair', pt: 'Cadeira' },
      { en: 'Window', pt: 'Janela' },
      { en: 'School', pt: 'Escola' }
    ],
    dificil: [
      { en: 'Drawer', pt: 'Gaveta' },
      { en: 'Lighthouse', pt: 'Farol' },
      { en: 'Needle', pt: 'Agulha' }
    ],
    muito_dificil: [
      { en: 'Thorough', pt: 'Minucioso' },
      { en: 'Whistleblower', pt: 'Denunciante' },
      { en: 'Hindsight', pt: 'Retrospectiva' }
    ]
  },
  es: {
    medio: [
      { en: 'Cat', es: 'Gato' },
      { en: 'Sun', es: 'Sol' },
      { en: 'Table', es: 'Mesa' }
    ]
  },
  fr: {
    medio: [
      { en: 'Book', fr: 'Livre' },
      { en: 'Car', fr: 'Voiture' },
      { en: 'Tree', fr: 'Arbre' }
    ]
  }
};

let persistedState = {}; // chatId -> state

async function loadState() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    persistedState = JSON.parse(raw);
  } catch {
    persistedState = {};
  }
}

async function saveState() {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(persistedState, null, 2), { encoding: 'utf8' });
  } catch (err) {
    console.error('[quiz] erro ao salvar estado:', err?.message || err);
  }
}

function normalizeAnswer(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove diacríticos
    .replace(/[^\p{L}\d\s]/gu, '')
    .trim()
    .toLowerCase();
}

function checkRateLimit(chatId) {
  const now = Date.now();
  const arr = rateLimitMap.get(chatId) || [];
  const filtered = arr.filter(ts => now - ts <= RATE_LIMIT_WINDOW_MS);
  filtered.push(now);
  rateLimitMap.set(chatId, filtered);
  return filtered.length <= RATE_LIMIT_MAX;
}

export default function handleQuiz(bot) {
  // carrega estado ao iniciar
  loadState();

  bot.onText(/\/quiz(?:\s+(\w+))?/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    if (!checkRateLimit(chatId)) {
      bot.sendMessage(chatId, '⏳ Muitas mensagens. Aguarde um pouco antes de continuar.');
      return;
    }

    const level = (match[1] || 'medio').toLowerCase();
    const lang = 'pt';

    if (!quizzes[lang] || !quizzes[lang][level]) {
      bot.sendMessage(chatId, '❌ Nível ou idioma não disponível.');
      return;
    }

    // inicia quiz para o usuário
    const question = quizzes[lang][level][Math.floor(Math.random() * quizzes[lang][level].length)];
    const answer = normalizeAnswer(Object.values(question)[1]);

    persistedState[chatId] = {
      question,
      level,
      lang,
      answer,
      attempts: 0,
      startedAt: Date.now()
    };

    await saveState();
const levelEsc = escapeMarkdownV2(level.toUpperCase());
const qEsc = escapeMarkdownV2(question.en);

bot.sendMessage(
  chatId,
  `🎯 Nível: <b>${level.toUpperCase()}</b>\nTraduz: <b>${question.en}</b>`,
  { parse_mode: 'HTML' }
);



  

  bot.on('message', async (msg) => {
    const chatId = String(msg.chat.id);
    const textoRaw = msg.text;
    if (!textoRaw) return;

    if (!checkRateLimit(chatId)) {
      bot.sendMessage(chatId, '⏳ Muitas mensagens. Aguarde um pouco antes de continuar.');
      return;
    }

    // ignora comandos
    if (textoRaw.trim().startsWith('/')) return;

    const state = persistedState[chatId];
    if (!state) return;

    state.attempts = (state.attempts || 0) + 1;

    const userAnswer = normalizeAnswer(textoRaw);
    const correct = state.answer;

    if (userAnswer === correct) {
      bot.sendMessage(chatId, '✅ Correto! Próxima pergunta:');
      // envia próxima pergunta (mantém nível)
      const questions = quizzes[state.lang][state.level];
      const q = questions[Math.floor(Math.random() * questions.length)];
      const nextAnswer = normalizeAnswer(Object.values(q)[1]);

      persistedState[chatId] = {
        question: q,
        level: state.level,
        lang: state.lang,
        answer: nextAnswer,
        attempts: 0,
        startedAt: Date.now()
      };
      await saveState();
      bot.sendMessage(chatId,`🎯 Nível: <b>${state.level.toUpperCase()}</b>\n<br>Traduz: <b>${q.en}</b>`,{ parse_mode: 'HTML' });

      return;
    }

    if (state.attempts >= MAX_ATTEMPTS_PER_QUESTION) {
    const ansEsc = escapeMarkdownV2(state.answer);
bot.sendMessage(chatId, `❌ Errado. Resposta certa: <b>${state.answer}</b>`, { parse_mode: 'HTML' });



      delete persistedState[chatId];
      await saveState();
    } else {
      const left = MAX_ATTEMPTS_PER_QUESTION - state.attempts;
      bot.sendMessage(chatId, `❌ Errado. Tente novamente. Tentativas restantes: ${left}`);
      await saveState();
    }
  });
})}
