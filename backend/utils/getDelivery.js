const deliveryZones = require("../data/deliveryZones");

function getDelivery(zip) {
  return deliveryZones.find(zone =>
    zone.zips.includes(zip)
  );
}

module.exports = getDelivery;