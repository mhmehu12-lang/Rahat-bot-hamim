# RX Chat Bot

## Overview
This is a Facebook Messenger chat bot built with Node.js. It uses the `rx-fca` library to connect to Facebook Messenger and provides various commands for users.

## Project Structure
- `Xrahat.js` / `Rahat.js` - Main entry files
- `config.json` - Bot configuration (prefix, admin IDs, API keys, etc.)
- `appstate.json` - Facebook session cookies (required for authentication)
- `Script/commands/` - Bot commands
- `Script/events/` - Event handlers
- `includes/` - Database and other includes
- `utils/` - Utility functions
- `languages/` - Language files

## How to Run
1. Add valid Facebook session cookies to `appstate.json`
2. Run `npm start`

## Configuration
- `PREFIX`: Command prefix (default: `-`)
- `ADMINBOT`: Array of Facebook user IDs with admin privileges
- `BOTNAME`: Display name of the bot

## Requirements
- Valid Facebook account session cookies in `appstate.json`
- The cookies must be in the correct JSON format exported from a Facebook session

## Current State
- Project is set up and ready
- Requires valid Facebook session data to authenticate and run
