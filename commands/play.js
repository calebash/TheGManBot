const { SlashCommandBuilder } = require("discord.js");
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");

const ytdl = require("ytdl-core-discord");

const { player } = require("../audioPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music by entering in a YouTube link!")
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("The link of the YouTube video")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const link = interaction.options.getString("link");
      let connection = getVoiceConnection(interaction.guild.id);

      if (connection == undefined) {
        connection = joinVoiceChannel({
          channelId: "1079060882216194119",
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }

      connection.subscribe(player);

      const stream = await ytdl(link, {
        highWaterMark: 1 << 25,
        filter: "audioonly",
      });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      });

      player.play(resource);

      await interaction.reply("Pong!");
    } catch (e) {
      let connection = getVoiceConnection(interaction.guild.id);

      if (connection !== undefined) connection.destroy();
      console.log(e.toString());
      await interaction.reply(
        "Jinkies! Something went wrong with that link, Scoobes!"
      );
    }
  },
};
