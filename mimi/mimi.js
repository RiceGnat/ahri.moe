var Discord = require('discord.io');
var http = require('https');
var auth = require('./auth.json');

var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

function StartBot() {
    bot.on('ready', function (evt) {
        console.log('Connected');
        console.log('Logged in as: ');
        console.log(bot.username + ' - (' + bot.id + ')');
    });

    bot.on('message', function (user, userID, channelID, message, evt) {
        if (message.substring(0, 1) == '!') {
            var args = message.substring(1).split(' ');
            var cmd = args[0];

            args = args.splice(1);
            switch (cmd) {
                case 'stream':
                    GetStreamInfo(args[0], (output) => {
                        bot.sendMessage({
                            to: channelID,
                            embed: output
                        });
                    });
                    break;
            }
        }
    });
}

function GetStreamInfo(name, callback) {
    var req = http.get(`https://api.picarto.tv/v1/channel/name/${name}`, (res) => {
        if (res.statusCode == 200) {
            var data = "";
            res.on("data", (chunk) => {
                data += chunk;
            }).on("end", () => {
                var stream = JSON.parse(data);
                callback(BuildEmbed(stream));
            });
        }
        else {
            callback("Stream not found");
        }
    });
    req.end();
}

function BuildEmbed(stream) {
    var last = new Date(stream.last_live);
    return {
        title: stream.name,
        url: `http://picarto.tv/${stream.name}`,
        description: stream.title + "\t" + (stream.gaming ? " :video_game:" : "") + (stream.adult ? " :underage:" : "") + (stream.commissions ? " :paintbrush:" : "") + (stream.private ? " :lock:" : ""),
        fields: [
            {
                name: "Status",
                value: stream.online ? "Online" : "Offline",
                inline: true
            },
            {
                name: "Category",
                value: stream.category,
                inline: true
            }
        ],
        thumbnail: { url: `https://picarto.tv/user_data/usrimg/${stream.name.toLowerCase()}/dsdefault.jpg` },
        image: stream.online ? { url: `https://thumb-us1.picarto.tv/thumbnail/${stream.name}.jpg` } : null,
        footer: !stream.online && last.valueOf() != 0 ? { text: `Last online on ${last.toDateString()}` } : null
    };
}

module.exports = {
    start: StartBot
}