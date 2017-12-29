const uuidV1 = require('uuid/v1');
const jwt = require('jwt-simple');


class Participants {

  constructor() {
    this.assignFields = this.assignFields.bind(this);
  }

  assignFields(app, pg) {


    app.get('/participants/:schemaID', async (req, res, next) => {
      await pg.select().table("participants").then(function(r) {
        res.send(r)
      })
      console.log("tested")
    })

    app.delete('/participants/:participantsID', async (req, res, next) => {
      await pg("participants").where({uuid: req.params.participantsID}).del().then(function(r) {
        res.sendStatus(200)
      })
    })

    app.delete
    app.post('/participants', async (req, res, next) => {
      const request = req.body;
      for(let i = 0; i < request.participants.length; i++) {
        const secret = "test";
        const payload = { schema: request.participants[i].schema, user: request.participants[i].user };
        request.participants[i]["token"] = jwt.encode(payload, secret);
        request.participants[i]["uuid"] = uuidV1();
        await pg("participants").insert(request.participants[i]).then(function() {
          res.send(200)
        })
      }
    })

  }

}

module.exports = Participants;