
# 🤖 Telegram Translate & Educational Bot

Um bot do Telegram que traduz mensagens, envia áudios com a pronúncia no idioma traduzido, oferece quizzes, desafios diários e definições de palavras. Perfeito para aprender idiomas de forma divertida e interativa.

## 📦 Funcionalidades

- 🌍 Tradução automática para vários idiomas com `/start` e escolha de idioma.
- 🔊 Pronúncia via áudio (TTS) usando `gtts`.
- 📘 Definições com exemplos de uso (via integração com dicionário ou ChatGPT).
- 🧠 Quiz de tradução com níveis (médio, difícil e muito difícil).
- 🎯 Desafio do dia com palavras/frases aleatórias para estudar.
- 🔄 Suporte multilíngue (PT, EN, ES, FR, DE, IT, JA, RU).

## 🚀 Instalação

1. Clone este repositório:

```bash
git clone https://github.com/seu-usuario/telegram-translate-bot.git
cd telegram-translate-bot
```

2. Instale as dependências:

```bash
npm install
```

3. Configure suas variáveis de ambiente:

Crie o arquivo `.env` dentro da pasta `settings`:

```
TELEGRAM_BOT_TOKEN=seu_token_aqui
OPENAI_API_KEY=seu_token_chatgpt (opcional)
```

4. Inicie o bot:

```bash
node index.js
```

> 💡 Use `nodemon index.js` para reinício automático durante o desenvolvimento.

## 🗂 Estrutura do Projeto

```
telegram-translate-bot/
│
├── educacional/
│   ├── definicao.js          # Comando /def (dicionário + exemplos)
│   ├── desafioDoDia.js       # Palavra/frase diária com tradução
│   ├── quiz.js               # Quiz com níveis de dificuldade
│
├── settings/
│   └── .env                  # Tokens de API
│
├── index.js                 # Arquivo principal do bot
├── package.json
└── README.md
```

## ✨ Comandos do Bot

- `/start` → Inicia e permite escolher idioma de tradução.
- `/lang <código>` → Define idioma de destino (ex: `/en` para inglês).
- `/def <palavra>` → Retorna definição, tradução e exemplo de uso.
- `/quiz` → Inicia quiz com perguntas sequenciais por dificuldade.
- `/desafio` → Envia desafio educacional diário com pronúncia.

## 🌐 Idiomas Suportados

| Código | Idioma    |
|--------|-----------|
| pt     | Português |
| en     | Inglês    |
| es     | Espanhol  |
| fr     | Francês   |
| de     | Alemão    |
| it     | Italiano  |
| ja     | Japonês   |
| ru     | Russo     |

## 🧠 Melhorias Futuras

- Interface web para gerenciar palavras e perguntas.
- Rankings de pontuação no quiz.
- Desafios semanais e recompensas.
- Tradução offline com cache.
- Modo estudo por categorias (ex: comida, viagem, trabalho).

## 📄 Licença

MIT License © 2025 - Desenvolvido com ❤️ por hacktall
