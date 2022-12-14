"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Client, Intents, Collection } = require("discord.js");
const { cyan, green, red } = require("colors/safe");

// configs
const config = require("../../Controller/emojis/emojis");

// utility
const { getAllFiles } = require("./util.js");

/* Initilize the client and define the intents necessary for commands/events ... */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
});
client.commands = new Collection();

/* Load commands. */
console.log(cyan("Loading Commands . . ."));
/* Get an array of all files in the commands folder. */
const commands = getAllFiles(path.join(__dirname, "../commands"));
if (commands.length <= 0) console.log(red("NO COMMANDS FOUND"));
else {
  /* Iterate every file in the array and require it. Also map it to the commands collection. */
  commands.forEach((file, i) => {
    const props = require(`${file}`);
    console.log(
      green(
        `${++i}. Command: ${file.split("\\").pop().split("/").pop()} loaded!`
      )
    );
    client.commands.set(props.data.name, props);
  });
}

/* Load events. */
console.log(cyan("Loading Events . . ."));
/* Get an array of all files in the events folder. */
const events = getAllFiles(path.join(__dirname, "../events"));
if (events.length <= 0) console.log(red("NO EVENTS FOUND"));
else {
  /* Iterate every file in the array and require it. Also register every event. */
  events.forEach((file, i) => {
    const event = require(`${file}`);
    console.log(
      green(`${++i}. Event: ${file.split("\\").pop().split("/").pop()} loaded!`)
    );
    if (event.data.once)
      client.once(event.data.name, (...args) =>
        event.run(...args).catch((err) => console.error(red(err)))
      );
    else
      client.on(event.data.name, (...args) =>
        event.run(...args).catch((err) => console.error(red(err)))
      );
  });
}

/* Login and connect the bot to the api. */
client.login(process.env.BOT_TOKEN);

module.exports = client;
