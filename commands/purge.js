const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge a channel with X number of messages (admin only)")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages you want to purge")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.BanMembers),

  async execute(interaction) {
    await interaction.reply("Messages purged!");
  },
};
