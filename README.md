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
```

### 3. Configure o Bot
Edite o arquivo `src/config/config.json` para personalizar as configurações do bot.

### 4. Inicie o Bot:
```bash
node .
```

## ☁️ Deploy na ShardCloud (Recomendado)

Para deploy rápido e gerenciamento simplificado, recomendamos usar a **ShardCloud**:

### 🚀 Deploy em 3 Passos

Este projeto já vem configurado para a **ShardCloud**:
1. O arquivo `.shardcloud` já está presente.
2. Defina as variáveis de ambiente no painel.
3. Faça o upload e inicie!

### 📋 Configuração na ShardCloud
Certifique-se de configurar as variáveis de ambiente obrigatórias no painel:
- `BOT_TOKEN`

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

## 📄 Licença

MIT

# discord-bot-welcome