const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const Deck = require('./models/deck.js')
const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/flashcard');
const MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
const ObjectId = require('mongodb').ObjectID;

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use('/public', express.static(path.join(__dirname, '/public')));
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.get('/', function(req,res){
  res.render('index');
})

app.get('/decks/create', function(req,res){
  res.render('createDeck');
})

app.get('/user/mydecks', function(req,res){
  Deck.find().then(function(results){
    res.render('myDecks',{myDecks:results})
  })
})
app.get('/user/decks/edit/:id', function(req,res){
  let id = req.params.id;
  Deck.findOne({_id:id}).then(function(results){
    console.log(results);
    res.render('editdeck', {myDecks:results})
  })
})
app.post('/user/decks/:id/addcard', function(req,res){
  let id = req.params.id;
  let newCard = {question: req.body.details, answer: req.body.answer};
  Deck.findOneAndUpdate({_id:id}, {$push:{card:newCard}}).then( function(){
    res.redirect('/user/decks/edit/'+id)
  })
})
app.post('/user/decks/deleteCard/:id', function(req,res){
  let id = req.params.id;
  Deck.update({
      _id: id
    },{$pull:{card:{_id: id}}})
    .then(function(results) {
      console.log(id);
      res.redirect('/user/mydecks');
    })
})
app.post('/decks/create', function(req,res){
  const myDeck = new Deck({
    name: req.body.name
  })
  myDeck.save().then(function(){
    res.redirect('/user/mydecks')
  })
})

app.post('/user/decks/delete/:id', function(req,res,next){
  let id = req.params.id;
  Deck.findOneAndRemove({
      _id: new ObjectId(id)
    })
    .then(function() {
      res.redirect('/user/mydecks');
    })
    .catch(function(error){
      console.log('error' + JSON.stringify(error));
      res.redirect('/')
    })

})
app.listen(3000, function() {
  console.log('successfully started Express Application');
})

process.on('SIGINT', function() {
  console.log("\nshutting down");
  mongoose.connection.close(function() {
    console.log('Mongoose default connection disconnected on app termination');
    process.exit(0);
  });
});
