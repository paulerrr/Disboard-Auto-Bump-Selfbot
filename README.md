# Discord Auto Bump Selfbot
[<img src="https://img.shields.io/github/license/appu1232/Discord-Selfbot.svg">](https://github.com/MonkoTubeYT/Disboard-Auto-Bump-Selfbot/blob/main/LICENSE)

A selfbot that automatically bumps your Discord server on Disboard every 2-2.5 hours.

# WARNING
**Selfbots are against Discord's Terms of Service.**
- Discord Terms: https://discord.com/terms
- Discord Guidelines: https://discord.com/guidelines

**This code is strictly for educational purposes.**

I am not liable for any accounts that get moderated by Discord due to the use of this selfbot. Use at your own risk.

# Features
- Automatically sends `/bump` command to Disboard bot
- Random intervals (2-2.5 hours) to avoid detection
- Persistent bump tracking (survives restarts)
- Automatic cooldown handling
- Verifies successful bumps before scheduling next bump
- Respects both user (30 min) and server (2 hour) cooldowns

# Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/MonkoTubeYT/Disboard-Auto-Bump-Selfbot.git
   cd Disboard-Auto-Bump-Selfbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

# Setup
1. Create a `.env` file (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and configure:
   ```env
   TOKEN=your_discord_token_here
   BUMP_CHANNEL=channel_id_here
   ```

3. Fill in the required values:
   - **TOKEN**: Your Discord user account token
   - **BUMP_CHANNEL**: The ID of the channel where Disboard bumps are sent

# How to Get Your User Token
1. Open Discord (web or desktop app)
2. Press `CTRL+SHIFT+I` (or `CMD+OPT+I` on Mac) to open Developer Console
3. Go to the **Console** tab
4. Copy and paste the code below into the console and press Enter:

```js
window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  req => {
    if (!req.c) {
      console.error('req.c is undefined or null');
      return;
    }

    for (const m of Object.keys(req.c)
      .map(x => req.c[x].exports)
      .filter(x => x)) {
      if (m.default && m.default.getToken !== undefined) {
        return copy(m.default.getToken());
      }
      if (m.getToken !== undefined) {
        return copy(m.getToken());
      }
    }
  },
]);
console.log('%cWorked!', 'font-size: 50px');
console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
```

5. Your token will be copied to your clipboard

# How to Get Channel ID
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want bumps to be sent
3. Click "Copy ID"

# Running the Bot

## Option 1: Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

3. View logs:
   ```bash
   docker-compose logs -f
   ```

4. Stop the bot:
   ```bash
   docker-compose down
   ```

The bot will automatically restart if it crashes, and bump data persists across container restarts.

## Option 2: Node.js Directly

Start the selfbot:
```bash
npm start
```

The bot will:
- Load the last bump time from `bump-data.json` (if it exists)
- Calculate if a bump is needed immediately or wait for cooldown
- Automatically bump and schedule the next bump

# How It Works
- Bumps are sent every 2-2.5 hours with random intervals to avoid pattern detection
- The bot verifies each bump was successful by checking Disboard's response
- Bump times are saved to `bump-data.json` to persist across restarts
- If the bot restarts, it checks when the last bump was and schedules accordingly

# Troubleshooting
- **Bot not bumping**: Check that your token and channel ID are correct in `.env`
- **"Bump failed"**: Verify Disboard bot is in your server and you have permission to use slash commands
- **Token errors**: Your token may have expired or been invalidated - get a new one
- **Cooldown active**: The bot respects Disboard's cooldowns - wait for them to expire
