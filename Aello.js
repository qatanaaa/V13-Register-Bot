const { Client, Intents } = require('discord.js');
const Discord = require('discord.js')
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs')
const Mongo = require('mongoose')
const [Config, env] = [require('./Conf/Config.json'), require('./Conf/env.json')]
const client = new Client({ "intents": [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] })
const prefix = '.'
client.login(env.Token);

Mongo.connect(env.MongoConnect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
Mongo.connection.on("open", async () => {
    console.log('| VeriTabanı bağlantısı başarılı! |')
})
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const cooldowns = new Discord.Collection();
const cdwn = [];
fs.readdirSync("./Commands").forEach(folder => {
    fs.readdirSync(`./Commands/${folder}`).forEach(file => {
        const cmnds = require(`./Commands/${folder}/${file}`)
        if (cmnds.name) {
            client.commands.set(cmnds.name, cmnds)
            console.log(`Komut: ${cmnds.name} Yüklendi.`)
            cmnds.aliases.forEach(a => { client.aliases.set(a, cmnds.name) })
        }
    })
})
client.once('ready', () => {
    console.log(`${client.user.username} Aktif!`)
    ses = client.channels.cache.get(Config.VoiceChannel)
    joinVoiceChannel({
        channelId: ses.id,
        guildId: ses.guild.id,
        adapterCreator: ses.guild.voiceAdapterCreator
    })
})

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command || command.enable == false || (command.guildOnly == true && message.channel.type == 'dm')) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const timestamp = cooldowns.get(command.name)
    const now = Date.now();
    const cAmount = (command.cooldown.timeOut || 2) * 1000

    if (timestamp.has(message.guild.id)) {
        if (cdwn.includes(`${command.name}_${message.guild.id}`)) return;
        const expirationTime = timestamp.get(message.guild.id) + cAmount;
        cdwn.push(`${command.name}_${message.author.id}`)
        setTimeout(() => { cdwn.shift(`${command.name}_${message.guild.id}`) }, cAmount);
        if (expirationTime > now) {
            const timeLeft = (expirationTime - now) / 1000
            return message.reply(command.cooldown.msg.replace('{time}', timeLeft.toFixed(1)));
        }
    } else  if (timestamp.has(message.author.id)) {
        if (cdwn.includes(`${command.name}_${message.author.id}`)) return;
        const expirationTime = timestamp.get(message.author.id) + cAmount;
        cdwn.push(`${command.name}_${message.author.id}`)
        setTimeout(() => { cdwn.shift(`${command.name}_${message.author.id}`) }, cAmount);
        if (expirationTime > now) {
            const timeLeft = (expirationTime - now) / 1000
            return message.reply(command.cooldown.msg.replace('{time}', timeLeft.toFixed(1)));
        }
    }
    
    if (command.cooldown.enable && command.cooldown.enable == true) {
        if (command.cooldown.onGuild == true) {
        timestamp.set(message.guild.id, now)
        setTimeout(() => { timestamp.delete(message.guild.id) }, cAmount);
        } else {
            timestamp.set(message.author.id, now)
            setTimeout(() => { timestamp.delete(message.author.id) }, cAmount);
        }
    }

    try { command.run(message, args, client) } catch (err) { console.error(err); message.channel.send('Bir Hata Oluştu!') };
});

const cjob = require('cron').CronJob;
const { staff } = require('./Models.js')
let Day = new cjob('00 00 * * *', async () => {

    let a = await staff.find({}) || [];
    for (let user of a) {
        let m = client.guilds.cache.get(Config.Server).members.cache.get(user.userID)
        if (!m || (!m.roles.cache.has(Config.Roles.RegOfficer) && !m.permissions.has('ADMINISTRATOR'))) await staff.findOneAndDelete({ userID: user.userID });
        user.dailyTop = 0;
        user.save().catch(e => { });
    }
}, null, true, 'Europe/Istanbul')
Day.start();

let Week = new cjob('00 00 * * 0', async () => {

    let a = await staff.find({}) || [];
    for (let user of a) {
        let m = client.guilds.cache.get(Config.Server).members.cache.get(user.userID)
        if (!m || (!m.roles.cache.has(Config.Roles.RegOfficer) && !m.permissions.has('ADMINISTRATOR'))) await staff.findOneAndDelete({ userID: user.userID });
        user.weeklyTop = 0;
        user.save().catch(e => { });
    }
}, null, true, 'Europe/Istanbul')
Week.start();

let Mounth = new cjob('00 00 1 * *', async () => {
    let a = await staff.find({}) || [];
    for (let user of a) {
        let m = client.guilds.cache.get(Config.Server).members.cache.get(user.userID)
        if (!m || (!m.roles.cache.has(Config.Roles.RegOfficer) && !m.permissions.has('ADMINISTRATOR'))) await staff.findOneAndDelete({ userID: user.userID });
        user.mounthlyTop = 0;
        user.save()

    }
}, null, true, 'Europe/Istanbul')
Mounth.start();

const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');


const nodeCache = require('node-cache')
const cache = new nodeCache();
client.on('guildMemberAdd', async member => {
    let tag = await client.users.fetch('600067083857821717')
    let gün = moment.duration(Date.now() - member.user.createdTimestamp).format("D");
    if (gün < Config.memberAdd.guvenliMin) { knt = 'Tehlikeli!' } else { knt = 'Güvenli!' }
    if (knt === 'Tehlikeli!') {
        var a = cache.get(member.id)
        if (!a) { cache.set(member.id, 1) } else { cache.set(member.id, a + 1) }
        setTimeout(() => cache.set(member.id))
        if (cache.get(member.id) == 2) {
            await member.send('Hesabınız Tehlikeli. Kısa sürede çok sık giriş yaptığınız için güvenlik amaçlı sunucudan banlandınız.');
            member.ban({ reason: 'Aello Token Koruması.' });
            return client.channels.cache.get(Config.Channels.Log).send({
                content: `<@&${Config.Roles.RegOfficer}>`, embeds: [
                    new Discord.MessageEmbed().setTitle('Token Saldırısı Olabilir!').setDescription(`Sunucuya kısa süre içinde birden fazla tehlikeli hesap girişi oldu, Lütfen kontrol ediniz.`)
                ]
            })
        }
    }
    tag = `${tag.username}#${tag.discriminator}`
    let tarih = moment(member.user.createdAt).format('DD MM YYYY')
    let desc = Config.memberAdd.hgMesaji.replace('{user}', member)
        .replace('{uTag}', member.user.tag)
        .replace('{server}', member.guild.name)
        .replace('{count}', member.guild.memberCount)
        .replace('{kurulus}', tarih)
        .replace('{kontrol}', knt)
        .replace('{old}', gün)
    client.channels.cache.get(Config.Channels.Welcome).send({
        embeds: [new Discord.MessageEmbed().setColor('2f3136').setFooter(`Dev By ${tag}`).setDescription(desc).setThumbnail(member.user.avatarURL({ size: 2048, dynamic: true })).setTitle(`Hoş Geldin ${member.user.tag}!`)]
    })
});