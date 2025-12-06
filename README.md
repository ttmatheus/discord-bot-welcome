# Welcome Bot Discord Node.js

Bot Discord completo desenvolvido em Node.js com sistema modular, focado em boas-vindas e fácil personalização.

## ✨ Funcionalidades Principais

- **Suporte a Comandos de Barra**: Slash Commands (`src/commands/slash`)
- **Interações**: Suporte a botões, menus de seleção e modais (`src/interactions`)
- **Configuração Simples**: Arquivo de configuração centralizado
- **Estrutura Robusta**: Handlers e Structures para escalabilidade

## 🚀 Início Rápido

### 1. Instale as Dependências
```bash
npm install
```

### 2. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`):
```env
BOT_TOKEN=seu_token_do_bot
MONGO_URI=seu_uri_do_mongodb
# Outras variáveis necessárias
```

### 3. Configure o Bot
Edite o arquivo `src/config/config.json` para personalizar as configurações do bot.

### 4. Inicie o Bot
Para desenvolvimento (com reinício automático):
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## ☁️ Deploy na ShardCloud (Recomendado)

Para deploy rápido e gerenciamento simplificado, recomendamos usar a **ShardCloud**:

### 🚀 Deploy em 3 Passos
1. **Crie o arquivo `.shardcloud`** (copie de `.shardcloud.example` se necessário)
2. **Configure as variáveis** no painel da ShardCloud
3. **Faça upload e deploy** - Pronto!

### 📋 Configuração na ShardCloud
Certifique-se de configurar as variáveis de ambiente obrigatórias no painel:
- `BOT_TOKEN`
- `MONGO_URI`

## 🛠️ Scripts Disponíveis

- `npm run dev` – Modo de desenvolvimento (Node.js com watch mode)
- `npm start` – Modo de produção
- `npm run format` – Formatar código com Prettier

## 📋 Estrutura do Projeto

```
welcome-bot/
├── src/
│   ├── assets/            # Ativos estáticos
│   ├── commands/          # Comandos do bot (Slash)
│   ├── config/            # Arquivos de configuração (config.json)
│   ├── events/            # Eventos do Discord
│   ├── functions/         # Funções utilitárias
│   ├── handler/           # Carregadores de comandos, eventos, etc.
│   ├── interactions/      # Interações (Buttons, Selects, Modals)
│   └── structures/        # Classes base (Client, etc.)
├── .env.example           # Exemplo de variáves de ambiente
├── .shardcloud.example    # Exemplo de configuração ShardCloud
├── index.js               # Ponto de entrada
└── package.json           # Dependências e scripts
```

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Discord.js v14** - Biblioteca para Discord API
- **Mongoose** - ODM para MongoDB
- **Prettier** - Formatação de código

## 📄 Licença

MIT

# discord-bot-welcome