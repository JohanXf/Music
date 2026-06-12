const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "say",
    category: "Dev",
    aliases: "",
    description: "",
    args: false,
    usage: "",
    userPerms: [],
    owner: false,
    execute: async (message, args, client, prefix) => {
    let faizen2 = ["1113028657762549770", "622786214776406017"];
      if(!faizen2.includes(message.author.id)) return
      
      const faizen = client.users.cache.get('1113028657762549770');
  
   const sayMessage = message.content.split(' ').slice(1).join(' ');
    if (!sayMessage) {
      const me = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({name: `Hey ${message.author.tag} Developed By FaizenSosuke </>`, iconURL: faizen.displayAvatarURL({dynamic: true})})
      return message.reply({embeds: [me]})
    }

    if (sayMessage) {
      message.delete();
   message.channel.send({content: `${sayMessage}`}), {
      allowedMentions: { parse: ["users"] },
    };
     }
  },
};