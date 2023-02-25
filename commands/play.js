require("dotenv").config();

const { SlashCommandBuilder } = require("discord.js");
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");

const ytdl = require("ytdl-core-discord");
const search = require("youtube-search");

const searchOptions = {
  maxResults: 1,
  key: process.env.YT_API_KEY,
};

const { player } = require("../audioPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Play music by entering in a YouTube link or searching for the title!"
    )
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
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.member.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }

      connection.subscribe(player);

      let searchLink = link;

      if (!link.includes("http")) {
        const { results } = await search(link, searchOptions);
        if (
          results.length === 0 ||
          results === undefined ||
          results[0] === undefined
        )
          return;
        searchLink = results[0].link;
      }

      const stream = await ytdl(searchLink, {
        highWaterMark: 1 << 25,
        filter: "audioonly",
      });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      });

      player.play(resource);

      const info = await ytdl.getBasicInfo(searchLink);

      await interaction.reply(`Cool! Now playing ${info.videoDetails.title}`);
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
