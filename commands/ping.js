const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong-- a simple test command!"),

  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
