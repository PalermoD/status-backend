let Hapi = require('hapi')
let Joi = require('joi')

let server = new Hapi.Server()

// Include Mongoose ORM to connect with database
var mongoose = require('mongoose');
// Making connection with `restdemo` database in your local machine
mongoose.connect('mongodb://localhost/postsdb');

var PostModel = require('./models/posts');

server.connection({port: 7002})

server.register({
    register: require('hapi-swagger'),
    options: {
        apiVersion: "0.0.1"
    }
}, function (err) {
    if (err) {
        server.log(['error'], 'hapi-swagger load error: ' + err)
    } else {
        server.log(['start'], 'hapi-swagger interface loaded')
    }
});


server.route({
    method: 'GET',
    path: '/api/posts',
    config: {
        tags: ['api'],
        description: 'Get all posts data',
        notes: 'Get all user data'
    },
    handler: function(request, reply){
        PostModel.find({}, (error, data) => {
            if(error){
                reply({
                    statusCode: 503,
                    message: error
                })
            } else {
                reply({
                    statusCode: 200,
                    message: 'User Data',
                    data: data
                })
            }
        })
    }
})

server.route({
    method: 'POST',
    path: '/api/posts',
    config: {
        tags: ['api'],
        description: 'Creats Posts',
        notes: 'create posts',
        validate: {
            payload: {
                title: Joi.string(),
                location: Joi.string(),
                content: Joi.string()
            }
        }
    },
    handler: function(request, reply){

        //Create mongodb post object to save to the database
        let post = new PostModel(request.payload)

        //Call save method to save to DB and callback to handle errors
        post.save((error, data) => {
            if(error){
                reply({
                    statusCode: 503,
                    message: error
                })
            } else {
                reply({
                    statusCode: 200,
                    message: 'Post saved',
                    data: data
                })
            }
        })
    }
})

server.start(function (){
    console.log('Server running at :', server.info.uri )
})
