const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuidV1 = require('uuid/v1');
const faker = require("faker");
const fs = require('fs');

//Load all schemes
const Schema = require('./src/Schema.js');
const Cells = require('./src/Cells.js');
const Users = require('./src/Users.js');
const Answers = require('./src/Answers.js');
const Organisations = require('./src/Organisations.js');
const Roles = require('./src/Roles.js');
const Participants = require('./src/Participants.js');
const Auth = require('./src/Auth.js');
const Feedback = require("./src/Feedback.js");
const Check = require('./src/helpers/check.js');

//Local helpers
const Seeder = require('./src/helpers/seeder.js')
const emitter = require('./src/helpers/emitter.js');


//Location of consumer-scropts
const consumers = './src/consumers/';

const app = express();
const server = http.Server(app);
const PORT = 3000;


class App {

  constructor(opts) {

    this.pg = require('knex')({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
      searchPath: 'knex,public'
    });

    const _this = this;

    this.pg.raw('select 1+1 as result').then(function () {
      _this.initialiseTables();
    });

    this.start = this.start.bind(this);

    this.app = express();
    this.s = http.Server(this.app);
  }

  async start() {
    //Initiate consumer-scripts for listening
    fs.readdirSync(consumers).forEach(consumer => {
      if(consumer.indexOf(".DS_Store") == -1 ){
        if(fs.existsSync(consumers + consumer + "/index.js")){
          require(consumers + consumer + "/index.js");
        }
      }
    });
    //Emit an example event
    emitter.emit("server.start", {});


    app.use( bodyParser.json() );       // to support JSON-encoded bodies

    app.use(cors({credentials: false, origin: '*'}))



    app.get('/', async (req, res, next) => {
      const result = {};

      await this.pg.select().table("schema").then(function(r) {
        result["schema"] = r;
      })
      await this.pg.select().table("cells").then(function(r) {
        result["cells"] = r;
      })
      await this.pg.select().table("answers").then(function(r) {
        result["answers"] = r;
      })

      res.send(result)
    })

    app.get('/check', async (req, res, next) => {
      await Check.checkCalls(res, this.pg);
    })

    new Schema().assignFields(app, this.pg);
    new Cells().assignFields(app, this.pg);
    new Auth().assignFields(app, this.pg);
    new Users().assignFields(app, this.pg);
    new Answers().assignFields(app, this.pg);
    new Organisations().assignFields(app, this.pg);
    new Roles().assignFields(app, this.pg);
    new Participants().assignFields(app, this.pg);
    new Seeder().assignFields(app, this.pg);
    new Feedback().assignFields(app, this.pg);

    server.listen(PORT, () => {
      console.log(`server up and listening on ${PORT}`)
    });
  }

  async initialiseTables() {

    await this.pg.schema.createTableIfNotExists('schema', function (table) {
      table.increments();
      table.uuid("uuid");
      table.string('title');
      table.json('headers');
      table.json('rows');
      table.dateTime("opens");
      table.dateTime("closes");
      table.uuid("creator");
      table.timestamps();
      table.uuid('organisationID');
      table.integer('published');
      table.json('consumer');
      table.json('roles');
    }).then(function() {
      console.log("created tables")
    });

    await this.pg.schema.createTableIfNotExists('cells', function (table) {
      table.increments();
      table.integer("tableID");
      table.string("col");
      table.string("row");
      table.integer("max");
      table.integer("current");
      table.uuid("uuid");
    }).then(function() {
      console.log("created cells")
    });

    await this.pg.schema.createTableIfNotExists('answers', function (table) {
      table.increments();
      table.uuid("cellID");
      table.string("participant");
      table.uuid("tableID");
      table.timestamps();
    }).then(function() {
      console.log("created answers")
    });

    await this.pg.schema.createTableIfNotExists('organisations', function (table) {
      table.increments();
      table.uuid("uuid").notNullable();
      table.string("name").notNullable();
      table.string("mainPhone");
      table.string("mainAddress");
      table.string("billInfo");
      table.timestamps();
    }).then(function() {
      console.log("created organisations")
    });

    await this.pg.schema.createTableIfNotExists('users', function (table) {
      table.increments();
      table.uuid("uuid");
      table.uuid("organisation");
      table.json("roles");
      table.string('password').notNullable();
      table.string("mail").notNullable();
      table.integer("status");
      table.string('given_name');
      table.string("family_name");
      table.timestamps(true, true);
    }).then(function() {
      console.log("created users")
    });


    await this.pg.schema.createTableIfNotExists('participants', function (table) {
      table.increments();
      table.uuid("uuid");
      table.string("mail").notNullable();
      table.string("name");
      table.json("roles");
      table.string("code");
      table.integer("status")
      table.uuid("organisationID");
      table.timestamps(true, true);
    }).then(function() {
      console.log("created participants")
    });

    await this.pg.schema.createTableIfNotExists('tokens', function (table) {
      table.increments();
      table.timestamps(true, true);
      table.uuid("user");
      table.text("token", "longtext");
      table.dateTime("expires_on");
    }).then(function() {
      console.log("created tokens")
    });

    

    await this.pg.schema.createTableIfNotExists('roles', function (table) {
      table.increments();
      table.timestamps(true, true);
      table.uuid("uuid");
      table.string("type");
      table.string("short");
      table.string("permissions");
      table.uuid('organisationID')
    }).then(function() {
      console.log("created roles")
    });


    await this.pg.schema.createTableIfNotExists('feedback', function (table) {
      table.increments();
      table.timestamps(true, true);
      table.uuid("uuid");
      table.string("feeling");
      table.text("message", "longtext");
      table.string("url");
      table.string("user");
    }).then(function() {
      console.log("created feedback")
    });
  }
}
module.exports = App;
