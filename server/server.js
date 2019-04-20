// jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// TODOS ROUTES

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        console.log('ID not valid');
        return res.status(404).send({
            error: 'Invalid ObjectID',
            statusCode: 404,
            message: 'Id is not a typeof ObjectID'
        });
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            console.log('Todo not found');
            return res.status(404).send({
                error: 'Todo not found',
                statusCode: 404,
                message: 'Todo does not exist in the database. ObjectID not recognized'
            });
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send({error: e});
    });
});

app.patch('/todos/update/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        console.log('ID not valid');
        return res.status(404).send({
            error: 'Invalid ObjectID',
            statusCode: 404,
            message: 'Id is not a typeof ObjectID'
        });
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            console.log('Todo not found');
            return res.status(404).send({
                error: 'Todo not found',
                statusCode: 404,
                message: 'Todo does not exist in the database. ObjectID not recognized'
            });
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send({error: e});
    });
});

// USERS ROUTES

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({users});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// PORT DECLARATION

app.listen(port, () => {
    console.log(`Started Server on port: ${port}`);
});

module.exports = {app};
