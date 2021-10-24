const Config = require('../../Conf/Config.json');
const Discord = require('discord.js')
const { staff } = require('../../Models')
const moment = require('moment')
moment.locale('tr')
module.exports = {
    name: 'info',
    enable: true,
    guildOnly: true,
    aliases: ['i'],
    cooldown: {
        enable: true,
        onGuild: false,
        timeOut: 30,
        msg: 'Bu komutu tekrar kullanabilmek için **{time}** saniye beklemelisin.'
    },

    run(message, args, client) {

        if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Config.Roles.RegOfficer)) return message.reply('Bu komutu kullanmak için yeterli yetkiye sahip değilsin!')
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        
        staff.findOne({ userID: member.id }, (err, data) => {
            if (!data) return message.reply('Bu kullanıcıya ait bir veri geçmişi bulunamadı.')
            message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor(member.displayHexColor).setTitle(`${member.user.tag} Kişi Bilgileri`).addField('Kayıt İstatistikleri', `**Toplam:** ${data.registerTop}\n **Bugün:** ${data.dailyTop}\n**Haftalık:** ${data.weeklyTop}\n**Aylık:** ${data.mounthlyTop}`) ] })
        })

    }
}