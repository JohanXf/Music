const { InteractionType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require('fs');
const Prefix = require('../../models/prefix');
const FavPlay = require("../../models/playlist");

module.exports = {
  name: 'interactionCreate',
  run: async (client, interaction, player) => {
    let prefix = client.prefix;
    const ress = await Prefix.findOne({ Guild: interaction.guildId });
    if (ress && ress.prefix) prefix = ress.prefix;

    if (interaction.type === InteractionType.ApplicationCommand) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.run(client, interaction, prefix);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription('An unexpected error occurred.')],
          ephemeral: true,
        }).catch(() => { });
      }
    } 
    
    // 2. Handle Birthday Button — show the modal
    if (interaction.isButton() && interaction.customId === 'bday_button') {
      const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

      const modal = new ModalBuilder()
        .setCustomId('bday_modal')
        .setTitle('Set Your Birthday Details');

      const dobInput = new TextInputBuilder()
        .setCustomId('dob')
        .setLabel('Date of Birth (DD/MM)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 12/06')
        .setRequired(true);

      const genderInput = new TextInputBuilder()
        .setCustomId('gender')
        .setLabel('Gender (male/female)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('male or female')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(dobInput),
        new ActionRowBuilder().addComponents(genderInput)
      );

      return await interaction.showModal(modal);
    }

    // 3. Handle Birthday Modal Submission
    if (interaction.isModalSubmit() && interaction.customId === 'bday_modal') {
      const dob = interaction.fields.getTextInputValue('dob');
      const gender = interaction.fields.getTextInputValue('gender');
      const filePath = './src/base/birthdays.json';

      try {
        let raw = '{}';
        try { raw = fs.readFileSync(filePath, 'utf8'); } catch (_) {}
        const data = raw.trim() ? JSON.parse(raw) : {};
        data[interaction.user.id] = { dob, gender };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return await interaction.reply({ content: '✅ Birthday saved!', ephemeral: true });
      } catch (err) {
        console.error(err);
        return await interaction.reply({ content: '❌ Error saving birthday.', ephemeral: true });
      }
    }

    // Button definitions
    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji(`<:nutzprev:1475040543875530843>`)
      .setStyle(ButtonStyle.Secondary);
    const pause = new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji(`<:nutzpause:1475040540402909287>`)
      .setStyle(ButtonStyle.Secondary);
    const resume = new ButtonBuilder()
      .setCustomId("resume")
      .setEmoji(`<:nutzresume:1475040546585055323>`)
      .setStyle(ButtonStyle.Success);
    const skip = new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(`<:nutzskip:1475040552125993131>`)
      .setStyle(ButtonStyle.Secondary);
    const stop = new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji(`<:nutzstop:1475040555082846313>`)
      .setStyle(ButtonStyle.Danger);
    const like = new ButtonBuilder()
      .setCustomId("like")
      .setLabel("Like")
      .setEmoji("<:nutzlike:1475040534568370279>")
      .setStyle(ButtonStyle.Success);
    const vup = new ButtonBuilder()
      .setCustomId("volup")
      .setEmoji(`<:nutzvolup:1475040560493498419>`)
      .setStyle(ButtonStyle.Secondary);
    const vdwn = new ButtonBuilder()
      .setCustomId("voldown")
      .setEmoji(`<:nutzvoldown:1475040558027112619>`)
      .setStyle(ButtonStyle.Secondary);
    const shuffle = new ButtonBuilder()
      .setCustomId("shuffle")
      .setEmoji(`<:nutzshuffle:1475040548573413448>`)
      .setStyle(ButtonStyle.Secondary);

    let row = new ActionRowBuilder().addComponents(prev, resume, skip, stop, vup);
    let row1 = new ActionRowBuilder().addComponents(prev, pause, skip, stop, vup);
    let row2 = new ActionRowBuilder().addComponents(vdwn, shuffle, like);

    if (interaction.isButton()) {
      const player = client.manager.players.get(interaction.guild.id);
      
      if (!player) return interaction.message.delete();

      if (!interaction.member.voice.channelId && interaction.user.id !== client.user.id && interaction.user.id !== client.config.ownerID) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription('You need to be in a voice channel to use this button!')],
          ephemeral: true
        });
      }

      if (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.config.ownerID) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription('You need to be in the same voice channel as me to use this button!')],
          ephemeral: true
        });
      }

      switch (interaction.customId) {
        case "skip":
          if (player.paused) {
            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Resume the player to skip the track!')],
              ephemeral: true
            });
          } else {
            player.skip();
            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Skipped the current track!')],
              ephemeral: true
            });
          }
          break;

        case "stop":
          player.destroy();
          interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription('Stopped the player and cleared the queue!')],
            ephemeral: true
          });
          break;

        case "prev":
          let seektime = player.position - 10000;
          if (seektime >= player.queue.current.duration - player.position || seektime < 0) {
            seektime = 0;
          }
          player.seek(Number(seektime));
          interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription('Rewound the track by 10 seconds!')],
            ephemeral: true
          });
          break;

        case "pause":
          player.pause(true);
          try {
            interaction.update({ components: [row, row2] });
          } catch (e) {
            console.log(e);
          }
          break;

        case "resume":
          player.pause(false);
          try {
            interaction.update({ components: [row1, row2] });
          } catch (e) {
            console.log(e);
          }
          break;

        case "volup":
          if (player.volume === 150) {
            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Maximum volume reached!')],
              ephemeral: true
            });
            return;
          }
          let amount = Number(player.volume) + 5;
          if (amount >= 100) amount = 100;
          player.setVolume(amount);
          interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription(`Volume increased to ${amount}%`)],
            ephemeral: true
          });
          break;

        case "voldown":
          if (player.volume === 0) {
            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Minimum volume reached!')],
              ephemeral: true
            });
            return;
          }
          let amount2 = Number(player.volume) - 5;
          if (amount2 <= 0) amount2 = 1;
          player.setVolume(amount2);
          interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription(`Volume decreased to ${amount2}%`)],
            ephemeral: true
          });
          break;

        case "shuffle":
          if (player.queue.length < 3) {
            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Not enough songs in the queue to shuffle!')],
              ephemeral: true
            });
            return;
          }
          player.queue.shuffle();
          interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription('Shuffled the queue!')],
            ephemeral: true
          });
          break;

        case "like":
          const Name = "Fav";
          let data = await FavPlay.findAll({ where: { userId: interaction.member.user.id, playlistName: Name } });

          if (data.length <= 0) {
            await FavPlay.create({
              userName: interaction.user.tag,
              userId: interaction.user.id,
              playlistName: Name,
              playlist: [],
            });

            try {
              data = await FavPlay.findAll({ where: { userId: interaction.member.user.id, playlistName: Name } });
            } catch (error) {
              return interaction.reply({
                embeds: [new EmbedBuilder()
                  .setColor(client.ankushcolor)
                  .setDescription('An error occurred while creating your playlist.')],
                ephemeral: true
              });
            }
          }

          let userData = await FavPlay.findAll({
            where: { userId: interaction.user.id },
          });

          if (userData.length >= 10) {
            return interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('You have reached the maximum number of favorite playlists!')],
              ephemeral: true
            });
          }

          const song = player.queue.current;
          let oldSong = [];

          if (data[0] && Array.isArray(data[0].playlist)) {
            oldSong = data[0].playlist;
          }

          oldSong.push({
            title: song.title,
            uri: song.uri,
            author: song.author,
            duration: song.length,
          });

          try {
            await FavPlay.update(
              { playlist: oldSong },
              {
                where: {
                  userId: interaction.user.id,
                  playlistName: Name,
                },
              }
            );

            interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('Added the current song to your favorites!')],
              ephemeral: true
            });
          } catch (error) {
            return interaction.reply({
              embeds: [new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('An error occurred while updating your playlist.')],
              ephemeral: true
            });
          }
          break;
      }
    }
  }
};