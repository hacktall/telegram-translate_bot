📘 Telegram Translate Bot

Um bot do Telegram que traduz mensagens, envia áudios com a pronúncia no idioma traduzido, oferece quizzes, desafios diários e definições de palavras. Perfeito para aprender idiomas de forma divertida e interativa.

## 📦 Funcionalidades

- � Tradução automática para vários idiomas com `/start` e escolha de idioma.
- 🔊 Pronúncia via áudio (TTS) usando `tts`.
- � Definições com exemplos de uso (via integração com dicionário ou ChatGPT).
- 🧠 Quiz de tradução com níveis (médio, difícil e muito difícil).
- 🎯 Desafio do dia com palavras/frases aleatórias para estudar.
- � Suporte multilíngue (PT, EN, ES, FR, DE, IT, JA, RU).

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

## � Estrutura do Projeto

```
telegram-translate-bot/
├── educacional/
│   ├── definicao.js      # /def - busca definições de palavras
│   ├── desafios.js       # /desafio - envia desafio do dia com áudio
│   ├── quiz.js           # /quiz - quiz interativo por nível
├── settings/
│   └── .env              # variáveis de ambiente (NÃO comitar)
├── index.js              # inicialização e lógica principal
├── package.json
└── README.md

🛠️ Instalação e Execução
1. Clonar o repositório
git clone https://github.com/hacktall/telegram-translate_bot.git
cd telegram-translate_bot

2. Instalar dependências
npm install

3. Configurar variáveis de ambiente

Crie o arquivo settings/.env:

TELEGRAM_BOT_TOKEN=seu_token_aqui
OPENAI_API_KEY=sua_chave_openai_opcional


⚠️ Nunca comite o .env no repositório.

4. Iniciar o bot
node index.js

💬 Comandos Disponíveis

/start → mostra idiomas disponíveis.

/def <palavra> → obtém definição, exemplo e tradução. obs:so aceita ingles por exemplo /def car

/quiz <nivel> → inicia quiz (níveis: medio, dificil, muito_dificil).

/desafio → envia desafio diário com áudio.


Exemplo: /en, /es, /fr.

Idiomas suportados:

🇬🇧 Inglês (/en)

🇧🇷 Português (/pt)

🇪🇸 Espanhol (/es)

🇫🇷 Francês (/fr)

🇩🇪 Alemão (/de)

🇮🇹 Italiano (/it)

🇯🇵 Japonês (/ja)

🇷🇺 Russo (/ru)

🔐 Segurança

Entrada sanitizada: evita injeção de Markdown.

Rate limiting: impede abuso com requisições excessivas.

Arquivos temporários únicos para áudios (sem sobrescrita).

Persistência simples de quiz em arquivo quiz_state.json (pode trocar para Redis).

Logs internos sem expor informações sensíveis.

Variáveis sensíveis (tokens e chaves) via .env.

🚀 Roadmap Futuro

 Interface web para gerenciar perguntas do quiz.

 Rankings globais de pontuação.

 Tradução offline com cache.

 Modo de estudo por categorias (comida, viagem, trabalho).

 Suporte a mais idiomas.

📜 Licença

Este projeto é open-source sob a licença MIT.
Contribuições são bem-vindas! 🎉