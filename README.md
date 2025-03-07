# Bot de Economia Básica

Este bot foi criado com **Discord.js** e oferece recursos como economia, jogos, sistema de logs e comandos interativos. Desenvolvido pelo **Jardim**.

## Índice

- [Funcionalidades](#funcionalidades)
- [Configuração](#configuração)
  - [Arquivo `.env`](#arquivo-env)
  - [Arquivo `config.json`](#arquivo-configjson)
  - [Arquivo `economy.json`](#arquivo-economyjson)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Como Funciona](#como-funciona)
- [Logs](#logs)
- [Status Cíclico](#status-cíclico)

---

## Funcionalidades

- Sistema de economia com apostas, corridas, trabalhos e recompensas diárias.
- Comandos de prefixo (`!`) e slash (`/`).
- Sistema anti-crash e monitoramento de recursos.
- Personalização de avatar/banner do bot.
- Placar de usuários com histórico de transações.
- Status automático do bot no Discord.

---

## Configuração

### **Arquivo `.env`**  
Contém variáveis sensíveis. **NUNCA COMPARTILHE ESTE ARQUIVO!**

```env
CLIENT_TOKEN="token"    # Token do bot (obtido no Discord Developer Portal)
MONGO_URI="mongouri"    # URI do MongoDB (obtido no MongoDB Atlas)
TZ="America/Sao_Paulo"  # Fuso horário para sincronização de tempos
```

#### **Como Obter os Valores**:
1. **`CLIENT_TOKEN`**:
   - Vá para o [Discord Developer Portal](https://discord.com/developers/applications).
   - Selecione seu bot > **Bot** > Copie o token.
   
2. **`MONGO_URI`**:
   - Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Crie um cluster e obtenha a URI de conexão (ex.: `mongodb+srv://user:password@cluster.mongodb.net/dbname`).

---

### **Arquivo `config.json`**  
Configurações gerais do bot.

```json
{
  "globalPrefix": "!",  // Prefixo para comandos de texto (ex.: "!ajuda")
  "ownerID": "799086286693597206",  // ID do dono do bot (para permissões especiais)
  "developerPermissions": {
    "799086286693597206": ["Dev", "Admin", "Mod"]  // Permissões de desenvolvedor por ID
  },
  "slashCommands": {
    "register": true,  // Registrar comandos de barra globalmente
    "guilds": []       // IDs de servidores para registro de comandos de barra (opcional)
  },
  "embedColors": {
    "green": "#00ff7f",  // Cor padrão para embeds de sucesso
    "red": "#ff1d0b"     // Cor padrão para embeds de erro
  },
  "webhookLoggers": {
    "errors": "https://discord.com/api/webhooks/...",  // URL do webhook para logs de erro
    "events": null                                   // Pode ser nulo se não usado
  },
  "guildLinks": {
    "support": { "name": null, "emoji": null, "url": null },  // Links de servidores relacionados
    "jardim": { "name": "Jardim", "emoji": "🍃", "url": "https://discord.gg/PVdBD8FX7Y" } // Exemplo
  },
  "botStatus": {
    "interval": 30000,  // Intervalo em milissegundos para atualizar o status
    "status": [         // Lista de status cíclicos
      { "type": 0, "name": "Sou uma aplicação muito legal! - 🍃 Desenvolvido por Jardim." },
      { "type": 3, "name": "Fui feito em JavaScript! - 🍃 Desenvolvido por Jardim." }
    ]
  }
}
```

---

### **Arquivo `economy.json`**  
Configurações do sistema de economia.

```json
{
  "emojis": {
    "money": "<:jardim:1181076936366248008>"  // Emoji da moeda (ex.: <:nome:ID>)
  },
  "names": {
    "money": "folhas"  // Nome da moeda (ex.: "folhas", "moedas", "dólares", etc...)
  },
  "limiters": {
    "coinflip": { "min": 0.5, "max": 100000 },  // Limites para apostas em cara-ou-coroa
    "slots": { "min": 10, "max": 50000 },       // Limites para o cassino
    "payment": { "min": 5, "max": 1000000 },    // Limites para pagamentos entre usuários
    "leaderboard": { "limit": 5 }              // Usuários por página no placar e páginas a serem vistas
  },
  "prizes": {
    "daily": { "min": 200, "max": 800 },        // Recompensa diária (valor aleatório)
    "weekly": { "min": 1000, "max": 4000 },     // Recompensa semanal
    "work": { "min": 20, "max": 80 }            // Recompensa por trabalho
  },
  "resets": {
    "daily": { "hour": 0, "minute": 0 },        // Horário de reset diário (00:00)
    "weekly": { "day": 1, "hour": 0, "minute": 0 }  // Reset semanal (segunda-feira às 00:00)
  },
  "settings": {
    "slots": {
      "emojis": {  // Emojis e multiplicadores do cassino
        "🍒": 2,   // Ex.: Cereja paga 2x o valor apostado
        "7️⃣": 10  // 7 paga 10x
      }
    },
    "work": {
      "cooldown": 60,  // Tempo de espera entre trabalhos (em minutos)
      "phrases": [     // Frases aleatórias ao trabalhar
        "Você trabalhou como **entregador** e ganhou {amount}!",
        "Você foi um **programador** por um dia e recebeu {amount}!"
      ]
    }
  }
}
```

---

## Comandos Disponíveis

### **Categorias**:

#### **Development** (Apenas para desenvolvedores, administradores e moderadores):
- `!addmoney <usuário> <valor>`  
- `!trocaravatar <imagem>`  
- `!trocarbanner <imagem>`  
- `!botban <usuário> [razão]`  
- `!botunban <usuário>`  
- `!eval <código>`  
- `!checkup`  
- `!removemoney <usuário> <valor>`  
- `!trocarusername <novo_nome>`  

#### **Economy**:
- `!saldo [usuário]`  
- `!tempos` (cooldowns)  
- `!diário` (recompensa diária)  
- `!placar [página]`  
- `!pagar <usuário> <valor>`  
- `!transações [página]`  
- `!semanal` (recompensa semanal)  
- `!trabalhar`  

#### **Games**:
- `!apostar <usuário> <valor>` (cara-ou-coroa)  
- `!cassino` (jogo de slots)  
- `!corrida` (corrida de emojis)  

#### **Informations**:
- `!informações` (sobre o bot)  
- `!convite` (link de convite)  
- `!ping` (latência do bot)  

#### **Miscellaneous**:
- `!ajuda` (menu interativo)  

---

## Como Funciona

### **Sistema de Economia**:
- **Moedas**: Usuários ganham moedas (`folhas`) através de trabalhos, recompensas diárias/semanais e apostas.
- **Apostas**: Em comandos como `!apostar` e `!cassino`, o bot usa transações para registrar ganhos/perdas.

### **Transações**:
- Todas as operações financeiras são registradas no banco de dados com detalhes como:
  ```json
  {
    "source": 6,  // Tipo de transação (ex.: 6 = cara-ou-coroa)
    "given_by": "123456789012345678",
    "received_by": "987654321098765432",
    "amount": 500
  }
  ```

### **Base de Dados**:
- Usa **MongoDB** para armazenar:
  - Saldo dos usuários (`Users`).
  - Configurações dos servidores (`Guilds`).
  - Histórico de transações (`Transactions`).

---

## Logs

- **Erros**: Enviados para o webhook definido em `webhookLoggers.errors`.
- **Eventos**: Pode ser configurado em `webhookLoggers.events` (opcional).

---

## Status Cíclico

- O bot atualiza automaticamente seu status no Discord a cada `30 segundos` com frases personalizadas (ex.: "Use os meus comandos!").

---

## Conclusão

Este bot é altamente personalizável e modular. Para dúvidas ou suporte, entre em contato no [Jardim](https://discord.gg/PVdBD8FX7Y).