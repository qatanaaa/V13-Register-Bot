const Config = require('../../Conf/Config.json');
const Discord = require('discord.js')
const { mmb } = require('../../Models')
const moment = require('moment')
moment.locale('tr')
module.exports = {
    name: 'cv',
    enable: true,
    guildOnly: true,
    aliases: ['sicil', 'geçmiş'],
    cooldown: {
        enable: false,
        onGuild: true,
        timeOut: 5,
        msg: 'Bu komutu tekrar kullanabilmek için **{time}** saniye beklemelisin.'
    },
    /**
     * .k @üye isim yaş
     */
    run (message, args, client)  {

        if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply('Bu komutu kullanmak için yeterli yetkiye sahip değilsin!')
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('Lütfen kontrol edilecek üyeyi belirtiniz.')
        mmb.findOne({ userID: member.id }, async (err, data) => {
            if(!data) return message.reply('Bu kişinin geçmişine ait veri bulunamadı.');
            try {
                await message.channel.send( { embeds: [new Discord.MessageEmbed().setColor('2F3136').addField(member.user.tag, data.cv.map((data, index) => (`**${index + 1}:**  ${data}`)).join('\n'))] })
            } catch {
                message.channel.send( `**${member.user.tag}**\n${data.cv.map((data, index) => (`**${index + 1}:**  ${data}`)).join('\n')}`, { split: true })
            }
        })
   
    }
}