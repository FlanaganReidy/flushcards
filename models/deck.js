const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  name:{type:String, unique:true, required:true},
  card:[{
    question:String,
    answer:String,
    history:[{
      correct:Boolean
    }]
  }]
})

const deck = mongoose.model('deck', deckSchema)

module.exports = deck;
