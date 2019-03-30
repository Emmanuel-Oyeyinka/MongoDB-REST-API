const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }
    console.log('Connected to MongoDB Server');

    const db = client.db('TodoApp');

    const todosCollection = db.collection('Todos');
    const usersCollection = db.collection('Users');

    // todosCollection.insertOne({
    //     text: 'Monday meeting',
    //     completed: true
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to add todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // usersCollection.insertOne({
    //     username: 'Olaoluwa',
    //     firstName: 'Emmanuel',
    //     lastName: 'Oyeyinka'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to add user', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    var user = {
        username: 'olaoluwa',
        firstName: 'Ayomide',
        lastName: 'Oyeyinka'
    };

    usersCollection.find({username: user.username}).toArray().then((u) => {
        console.log(`Result: ${JSON.stringify(u, undefined, 2)}`);

        if (u.length === 0) {
            return usersCollection.insertOne(user, (err, result) => {
                if (err) {
                    return console.log('Unable to add user', err);
                }
                console.log(`User added \nTime: ${result.ops[0]._id.getTimestamp().toString()}, \nUser info: ${JSON.stringify(result.ops, undefined, 2)}`);
            });  
        };
        console.log('Username already exist.');
    }).catch((e) => {
        console.log(e);
    });

    // client.close();
});