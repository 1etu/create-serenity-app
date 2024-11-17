# create-serenity-app
A CLI tool to quickly create Discord bots using Rust and the Serenity framework.

## Features
- Creates a fully structured Discord bot project
- Includes basic command handling
- Sets up event handlers
- Configurable command prefix
- Built-in ping command example
- Server join event handling

## Installation
```bash
npm install -g create-serenity-app
```

## Usage
```bash
create-serenity-app
```

## Getting Started
1. Create a new project:
```bash
create-serenity-app bot-boilerplate
```

3. Navigate to the project folder:
```shell
cd bot-boilerplate
```

5. Configure your .ENV file locally:
```shell
DISCORD_TOKEN=your_token_here
COMMAND_PREFIX=!
```

7. Run:
```bash
cargo run
```

## Requirements and Dependecies:
Node.js (for installation)
Rust and Cargo
A Discord bot token
