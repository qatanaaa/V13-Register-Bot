const mongo = require('mongoose');

const memberS = mongo.Schema({
    userID: String,
    regSize: {type: Number, default: 0},
    cv: Array
});

const staffS = mongo.Schema({
    userID: String,
    registerTop: {type: Number, default: 0},
    dailyTop: {type: Number, default: 0},
    weeklyTop: {type: Number, default: 0},
    mounthlyTop: {type: Number, default: 0}
});


const mmb = mongo.model("Member", memberS)
const staff = mongo.model("Staf", staffS)
module.exports = { mmb, staff }
