require("dotenv").config();

const botMessages = require("../botMessages.json");

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

const getYoutubeLink = async (link) => {
  if (link.includes("http")) return link;

  const { results } = await search(link, searchOptions);
  if (results.length === 0 || results === undefined || results[0] === undefined)
    return;

  return results[0].link;
};

const getConnection = (interaction) => {
  const connection = getVoiceConnection(interaction.guild.id);

  if (connection !== undefined) return connection;

  return joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.member.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });
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
      const linkArg = interaction.options.getString("link");
      const connection = getConnection(interaction);
      const link = await getYoutubeLink(linkArg);
      const info = await ytdl.getBasicInfo(link);

      connection.subscribe(player);

      const stream = await ytdl(link, {
        highWaterMark: 1 << 25,
        filter: "audioonly",
        quality: "lowest",
      });

      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      });

      player.play(resource);

      const botMessageIndex = Math.floor(Math.random() * botMessages.length);
      await interaction.reply(
        `${botMessages[botMessageIndex]} Now playing ${info.videoDetails.title}`
      );
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
