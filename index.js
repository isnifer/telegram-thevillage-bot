var Bot = require('node-telegram-bot');
var request = require('request');
var Q = require('q');
var Parser = require('xml2js').Parser;
var token = require('./token');

var bot = new Bot({token: token.bot});

var parser = new Parser({
    normalizeTags: true
});

var messages = {
    hopesandfears: 'http://www.the-village.ru/feeds/posts.atom?city=1&topic=hopesandfears',
    apartments: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=apartments',
    onthestreet: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=on-the-street',
    newplace: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=new-place',
    interior: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=interior',
    broadcasting: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=broadcasting',
    moscowmorning: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=moscow-morning',
    news: 'http://www.the-village.ru/feeds/posts.atom?city=1&news=only'
};

function getRandom (maxValue) {
    return Math.floor(Math.random() * maxValue) + 1;
}

function getTheVillage (url, messageData, ctx, message) {
    var lastMessages = parseInt(messageData[1]);
    request.get({url: url}, function (err, res, body) {
        parser.parseString(body, function (err, result) {
            for (var i = 0; i < (!isNaN(lastMessages) ? lastMessages : 1); i++) {
                ctx.sendMessage({
                    chat_id: message.chat.id,
                    text: result.feed.entry[i].title + '\n' +result.feed.entry[i].id[0]
                });
            }
        });
    });
}

var subscribers = [];
var startMessage = [
    'Hi! I am The-Village.ru news Bot!',
    'I can tell you the latest news from The-Village.ru by category.',
    'You can send me next commands:'
];

Object.keys(messages).forEach(function (e) {
    startMessage.push('/' + e);
});

startMessage.push('Let\'s try!');

bot.on('message', function (message) {
    var self = this;
    var chat = message.chat.id;
    var index = subscribers.indexOf(chat);
    var messageData;
    var command;

    console.dir(message);

    if (message.text) {

        messageData = message.text.toLowerCase().replace('@thevillagebot', '').split(' ');
        command = messageData[0].slice(1);

        if (command === 'start') {
            self.sendMessage({
                chat_id: chat,
                text: startMessage.join('\n')
            });
        }

        if (messages[command]) {
            getTheVillage(messages[command], messageData, self, message);
        }

    }

});

bot.start();
