const mtgsdk = require('mtgsdk');

function GetCard(options, callback) {
    const name = options.name;
    var set = options.set && options.set != '' ? options.set : '';
    var card = null;
    var isPromo = set == "000" || set == "PSG";
    var isSetDefined = set != '';

    // Correcting set codes from Tapped Out
    if (set == "UN3") set = "UST";
    else if (set == "AKHMPS") set = "MPS_AKH";
    else if (set == "GRV") set = "PD3";

    mtgsdk.card.where({ name: name, set: isPromo ? '' : set }).then(cards => {
        var matchCards = function () {
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].name.toLowerCase() == name.toLowerCase() && (
                    isSetDefined && (cards[i].set == set || isPromo && cards[i].set.startsWith("p")) ||
                    !isSetDefined && cards[i].rarity != "Special")) {
                    card = cards[i];
                    break;
                }
            }
        }

        matchCards();

        // Workaround for case where card is not found (eg Anguished Unmaking promo)
        if (card == null) {
            set = '';
            isSetDefined = false;
            isPromo = false;
            matchCards();
        }

        mtgsdk.set.find(card.set).then(result => {
            var ret = {
                supertypes: card.supertypes,
                types: card.types,
                subtypes: card.subtypes,
                colors: card.colors,
                cmc: card.cmc,
                set: card.set,
                imgset: result.set.magicCardsInfoCode,
                border: set == "MPS_AKH" ? "borderless" : result.set.border
            };

            callback(ret);
        });
    });
}

module.exports = {
    fetch: GetCard
}