const mtgsdk = require('mtgsdk');

function GetCard(name, callback) {
    mtgsdk.card.where({ name: name }).then(cards => {
        var card = cards[0];
        var result = {
            supertypes: card.supertypes,
            types: card.types,
            subtypes: card.subtypes,
            colors: card.colors,
            cmc: card.cmc
        }

        callback(result);
    });
}

module.exports = {
    fetch: GetCard
}