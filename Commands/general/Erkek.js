const Config = require('../../Conf/Config.json');
const Discord = require('discord.js')
const { mmb, staff } = require('../../Models')
const moment = require('moment')
moment.locale('tr')
module.exports = {
    name: 'erkek', // Komut adı
    enable: true, // Komut çalışsın mı?
    guildOnly: true, // Komut sadece sunucuda mı çalışsın?
    aliases: ['e', 'male'], //Bu dosyayı çalıştıracak diğer komutlar
    cooldown: {
        enable: true, // Cooldown aktif edilsin mi?
        onGuild: false, // Cooldown sunucuyu mu kapsasın?
        timeOut: 15, // Cooldown kaç saniye sürecek?
        msg: 'Bu komutu tekrar kullanabilmek için **{time}** saniye beklemelisin.' //Cooldown mesajı
    },
    /**
     * .k @üye isim yaş
     */
    run(message, args, client) {

        if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Config.Roles.RegOfficer)) return message.reply('Bu komutu kullanmak için yeterli yetkiye sahip değilsin!')
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('Lütfen kayıt edilecek üyeyi belirtiniz.')
        let isim = args[1];
        let yas = args[2];

        if (message.guild.roles.cache.has(Config.Roles.Uye)) member.roles.add(Config.Roles.Uye).catch(e => { });
        if (member.roles.cache.has(Config.Roles.Kadin)) member.roles.remove(Config.Roles.Kadin).catch(e => { });
        member.roles.add(Config.Roles.Erkek).catch(e => { })
        member.roles.remove(Config.Roles.Kayitsiz).catch(e => { });

        if (isim && yas) {
            if (isNaN(args[2])) return message.reply('Lütfen geçerli bir yaş belirtiniz.')
            member.setNickname(`${Config.Tag ? Config.Tag : ''} ${isim} ${yas} `).catch(e => { });
            message.channel.send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle(member.user.tag).setDescription(`**${member} Başarıyla kayıt edildi!**`)] }).catch(e => { });
            client.channels.cache.get(Config.Channels.Log).send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle('Kayıt İşlemi').setDescription(`\`Yetkili:\` **${message.author.tag} - ${message.author.id}**`).addField(`ÜYE`, `\`Üye:\` **${member} - ${member.id}**\n \`İsim Yaş:\` **${isim} ${yas}**\n \`Cinsiyet\` **Erkek.**`)] })
            mmb.findOne({ userID: member.id }, (err, data) => {
                if (!data) { new mmb({ userID: member.id, regSize: 1, cv: [`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")} **Cinsiyet:** Erkek. `] }).save() } else {
                    data.regSize++, data.cv.push(`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")}, İsim: ${isim} ${yas} **Cinsiyet:** Erkek.`), data.save()
                }
            })

        } else if (isim && !yas) {
            member.setNickname(`${Config.Tag ? Config.Tag : ''} ${isim}`).catch(e => { });
            message.channel.send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle(member.user.tag).setDescription(`**${member} Başarıyla kayıt edildi!**`)] }).catch(e => { });
            client.channels.cache.get(Config.Channels.Log).send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle('Kayıt İşlemi').setDescription(`\`Yetkili:\` **${message.author.tag} - ${message.author.id}**`).addField(`ÜYE`, `\`Üye:\` **${member} - ${member.id}**\n \`İsim:\` **${isim}**\n \`Cinsiyet\` **Erkek.**`)] })
            mmb.findOne({ userID: member.id }, (err, data) => {
                if (!data) { new mmb({ userID: member.id, regSize: 1, cv: [`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")} `] }).save() } else {
                    data.regSize++, data.cv.push(`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")}, İsim: ${isim} **Cinsiyet:** Erkek.`), data.save()
                }
            })

        } else if (!isim) {
            message.channel.send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle(member.user.tag).setDescription(`**${member} Başarıyla kayıt edildi!**`)] }).catch(e => { });
            client.channels.cache.get(Config.Channels.Log).send({ embeds: [new Discord.MessageEmbed().setFooter(message.guild.name).setColor('2F3136').setTitle('Kayıt İşlemi').setDescription(`\`Yetkili:\` **${message.author.tag} - ${message.author.id}**`).addField(`ÜYE`, `\`Üye:\` **${member} - ${member.id}**\n \`İsim:\` **Belirtilmedi**\n \`Cinsiyet\` **Erkek.**`)] })
            mmb.findOne({ userID: member.id }, (err, data) => {
                if (!data) { new mmb({ userID: member.id, regSize: 1, cv: [`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")} `] }).save() } else {
                    data.regSize++, data.cv.push(`**Kayıt Eden:** <@${message.author.id}>, **Tarih:** ${moment(Date.now()).format("** HH.mm - DD.MM.YY **")}, **İsim:** Belirtilmedi,  **Cinsiyet:** Erkek.`), data.save()
                }
            })
        }

        
        staff.findOne({ userID: message.author.id }, (err, data) => {
            if (!data) { new staff({ userID: message.author.id, registerTop: 1, dailyTop: 1, weeklyTop: 1, mounthlyTop: 1 }).save() }
            else { data.registerTop++, data.dailyTop++, data.weeklyTop++, data.mounthlyTop++, data.save() }
        })
    }
}