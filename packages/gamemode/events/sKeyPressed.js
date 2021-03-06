const Players = require('../modules/players');
const PM = require('../messages/player.json');
const Factions = require('../modules/factions');
const Ammunation = require('../data/ammunation.json');

module.exports = {
    "sKeyPressed" : (player, key) => {
        if(key === "Y") {
            let done = false;
            mp.markers.forEachInRange(player.position, 3, (b) => {
                if(b.teleporter && b.dimension === player.dimension && !done) {
                    if(b.faction !== 1 && Players.PlayerHaveAccess(player.ID, b.faction) && !player.adminID) return player.notify(PM.AccessTP)
                    player.call("fadeOut");
                    setTimeout(function() {
                        let veh;
                        let seat;
                        if(b.veh && player.vehicle) {
                            veh = player.vehicle;
                            seat = player.seat;
                            player.vehicle.position = b.to;
                        } else if(!b.veh && player.vehicle) return player.notify(PM.IsInVehicle)
                        player.dimension = b.to_dimension;
                        player.position = b.to;
                        if(b.veh && typeof veh !== "undefined") {
                            player.putIntoVehicle(veh, seat)
                            player.vehicle.heading = b.to_angle;
                        }
                        player.heading = b.to_angle;
                        player.call("fadeIn");
                    }, 1000);

                    done = true;
                    return false;
                } else if(b.reseller) {
                    mp.events.call("resellCar", player);
                }
            });
        }
    },
    "colshapeATMMenu": (player, markerID) => player.call("ATMChoice", [markerID]),
    "colshapeVehicleCustom": (player, markerID) => mp.events.call("showVehicleCustom", player, mp.markers[markerID].customID),
    "colshapeVehicleShop": (player, markerID) => mp.events.call("showVehicleShop", player, mp.markers[markerID].carShopType),
    "colshapeArrest": (player, markerID) => { 
        mp.players.forEachInRange(player.position, 10, (p2) => {
            if(Players.isPlayerCuffed(p2.ID) && Factions.isFactionCops(Players.getPlayerFaction(player.ID))) {
                mp.events.call("PutPlayerInJail", player, p2);
            }
        });
    },
    "colshapeStore": (player, markerID) => {
        let b = mp.markers[markerID];
        if(b.store && !b.robbed) {
            switch(b.storeType) {
                case 1:
                    player.call("247choice", [b.sqlid]);
                    break;
                case 2:
                    player.call("AMMUNATIONchoice", [b.sqlid, JSON.stringify(Ammunation[b.sqlid])]);
                    break;
            }
            return false;
        }
        else if(b.store && b.robbed) {
            player.notify(PM.StoreAlreadyRobbed);
        }
    }
};