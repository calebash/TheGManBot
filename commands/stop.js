const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const { player } = require("../audioPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music :("),

  async execute(interaction) {
    try {
      let connection = getVoiceConnection(interaction.guild.id);
      if (connection == undefined)
        return await interaction.reply(
          "There's no music to be stopped, sorry about that!"
        );

      player.stop();
      connection.destroy();
      await interaction.reply("Stopped playing music. Take that John!");
    } catch (e) {
      let connection = getVoiceConnection(interaction.guild.id);

      if (connection !== undefined) connection.destroy();
      console.log(e.toString());
      await interaction.reply("Jinkies! Something went wrong!");
    }
  },
};
