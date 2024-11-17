#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { Command } = require('commander');
const inquirer = require('inquirer');

const program = new Command();

program
  .name('create-serenity-app')
  .description('Create a new Discord bot using Rust and Serenity')
  .argument('[name]', 'Name of your bot project')
  .action(async (name) => {
    let projectName = name;
    
    if (!projectName) {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is the name of your bot project?',
          default: 'my-discord-bot'
        }
      ]);
      projectName = response.name;
    }

    const projectPath = path.join(process.cwd(), projectName);
    
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'commands'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'events'), { recursive: true });

    const cargoToml = `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.21.2", features = ["macros", "rt-multi-thread"] }
serenity = { version = "0.12", features = ["client", "gateway", "rustls_backend", "model", "cache"] }
dotenv = "0.15"`;

    fs.writeFileSync(path.join(projectPath, 'Cargo.toml'), cargoToml);

    const envFile = `DISCORD_TOKEN=your_token_here
COMMAND_PREFIX=!`;
    fs.writeFileSync(path.join(projectPath, '.env'), envFile);

    const commandsMod = `pub mod ping;

pub use ping::*;`;
    fs.writeFileSync(path.join(projectPath, 'src', 'commands', 'mod.rs'), commandsMod);

    const pingCommand = `use serenity::all::*;

pub async fn run(ctx: &Context, msg: &Message) -> Result<(), Error> {
    msg.channel_id.say(&ctx.http, "Pong! 🏓").await?;
    Ok(())
}
`;
    fs.writeFileSync(path.join(projectPath, 'src', 'commands', 'ping.rs'), pingCommand);

    const eventsMod = `pub mod join;

pub use join::*;`;
    fs.writeFileSync(path.join(projectPath, 'src', 'events', 'mod.rs'), eventsMod);

    const joinEvent = `use serenity::all::*;

pub async fn handle_join(ctx: &Context, guild: &Guild) {
    println!("Joined guild: {}", guild.name);
    
    if let Some(channel) = guild.system_channel_id {
        let _ = channel
            .say(&ctx.http, "Hello! Thanks for inviting me to your server! 👋")
            .await;
    }
}`;
    fs.writeFileSync(path.join(projectPath, 'src', 'events', 'join.rs'), joinEvent);

const mainRs = `mod commands;
mod events;

use std::env;
use serenity::all::*;
use serenity::async_trait;
use dotenv::dotenv;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        let prefix = env::var("COMMAND_PREFIX").unwrap_or_else(|_| "!".to_string());
        
        if msg.content == format!("{}ping", prefix) {
            if let Err(why) = commands::run(&ctx, &msg).await {
                println!("Error executing command: {:?}", why);
            }
        }
    }

    async fn guild_create(&self, ctx: Context, guild: Guild, is_new: Option<bool>) {
        events::handle_join(&ctx, &guild).await;
    }

    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    let token = env::var("DISCORD_TOKEN")
        .expect("Expected a token in the environment");

    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT
        | GatewayIntents::GUILDS;

    let mut client = Client::builder(&token, intents)
        .event_handler(Handler)
        .await
        .expect("Error creating client");

    if let Err(why) = client.start().await {
        println!("Client error: {:?}", why);
    }
}`;

    fs.writeFileSync(path.join(projectPath, 'src', 'main.rs'), mainRs);

    const gitignore = `/target
**/*.rs.bk
Cargo.lock
.env`;
    
    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

    console.log(chalk.green(`\n✨ Successfully created ${projectName}!\n`));
    console.log('To get started:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  Add your Discord bot token to .env'));
    console.log(chalk.cyan('  cargo run\n'));
  });

program.parse();