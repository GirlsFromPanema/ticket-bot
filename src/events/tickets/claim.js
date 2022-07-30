"use strict";

const {
  CommandInteraction,
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");
const config = require("../../../Controller/config");

const Guild = require("../../models/TicketPanel");

module.exports.data = {
  name: "interactionCreate",
  once: false,
};

/**
 * Handle the clients interactionCreate event.
 * @param {CommandInteraction} interaction The interaction that triggered the event.
 */
module.exports.run = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });
    if (interaction.customId === "claim-ticket" && interaction.channel.name.includes("ticket")) {

      const binButton = new MessageActionRow().addComponents(
        new MessageButton()
            .setStyle("SECONDARY")
            .setEmoji("🗑️")
            .setCustomId("delete-button"),
    );

      const channel = interaction.channel;
      const userThatClaimed = interaction.user;
      const member = await interaction.guild.members.fetch(channel.topic); // fetch the member ID from the channel topic
      const supportRole = await interaction.guild.roles.fetch(guildQuery.ticketrole);

      const embed = new MessageEmbed()
        .setTitle("Claimed ticket!")
        .setDescription(`Ticket claimed from <@!${interaction.user.id}>!`)
        .setColor("RED")
        .setFooter({
          text: `${interaction.guild.name}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        });

      //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true,});

      // check if interaction.user has admin permissions
      if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

      // disable the claim-button once its clicked
      let row = interaction.message.components[0];
      row.components.map((component) => component.setDisabled(false));
      interaction.update({ components: [row] });

      // Supporters cant type anymore
      interaction.message.channel.permissionOverwrites.edit(supportRole, {
        SEND_MESSAGES: false,
      });

      // The user that claimed the ticket is allowed to send messages
      interaction.message.channel.permissionOverwrites.edit(userThatClaimed, {
        SEND_MESSAGES: true,
      });

      await channel.send({
        content: `<@${member.id}> your ticket got claimed!`,
        components: [binButton],
        embeds: [embed],
      });
    }
  } catch (err) {
    console.error(err);
  }
};
