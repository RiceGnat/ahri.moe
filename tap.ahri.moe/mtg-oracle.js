const mtgsdk = require('mtgsdk');

function GetCard(name, callback) {
    mtgsdk.card.where({ name: name }).then(cards => {
        var i = 0;
        do {
            card = cards[i];
            console.log(card.name);
            i++;
        } while (card.name.toLowerCase() != name.toLowerCase());
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