const quizWords = [
  { en: 'dog', pt: 'cachorro' },
  { en: 'cat', pt: 'gato' },
  { en: 'house', pt: 'casa' },
  { en: 'car', pt: 'carro' },
  { en: 'book', pt: 'livro' },
];

const userQuizState = {};

export default function handleQuiz(bot) {
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

  const userQuiz = {}; // Armazena estado do quiz por usuário

  bot.onText(/\/quiz(?:\s+(\w+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const level = match[1] || 'medio';
    const lang = 'pt'; // idioma base, você pode ler da config do usuário

    if (!quizzes[lang] || !quizzes[lang][level]) {
      bot.sendMessage(chatId, '❌ Nível ou idioma não disponível.');
      return;
    }

    sendNextQuestion(chatId, level, lang);
  });

  function sendNextQuestion(chatId, level, lang) {
    const questions = quizzes[lang][level];
    const q = questions[Math.floor(Math.random() * questions.length)];

    userQuiz[chatId] = {
      question: q,
      level,
      lang,
      answer: Object.values(q)[1].toLowerCase()
    };

    bot.sendMessage(chatId, `🎯 Nível: ${level.toUpperCase()}\nTraduz: *${q.en}*`, { parse_mode: 'Markdown' });
  }

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const texto = msg.text?.toLowerCase();

    if (!userQuiz[chatId] || texto.startsWith('/')) return;

    const { answer, level, lang } = userQuiz[chatId];

    if (texto === answer) {
      bot.sendMessage(chatId, '✅ Correto! Próxima pergunta:');
      sendNextQuestion(chatId, level, lang);
    } else {
      bot.sendMessage(chatId, `❌ Errado. Resposta certa: *${answer}*`, { parse_mode: 'Markdown' });
      delete userQuiz[chatId];
    }
  });
}
