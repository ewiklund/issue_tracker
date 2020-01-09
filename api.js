/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      const project = req.params.project;
      const collection = 'issues';

      if (req.query.open !== undefined) {
        req.query.open = (req.query.open == 'true')
      }

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection('collection').find(req.query).toArray((err, result)=> {
          if (err) throw err
          res.send(result)
        });
      });

    })

    .post(function (req, res){
      const project = req.params.project;
      const collection = 'issues';

      if (req.body.issue_title == undefined |
          req.body.issue_text == undefined  |
          req.body.created_by == undefined) {
            res.status(500)
            res.render('error', {error: "Required text is not filled in"});
          }

          const created_on = new Date();
          const updated_on = created_on;
          const open = true;
          const newIssue = {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text,
            created_on,
            updated_on,
            open
          }

          MongoClient.connect(CONNECTION_STRING, function(err, db) {
            db.collection('collection').insertOne(newIssue, (err, doc)=> {
              if (err) {
                console.log("New issue: There is an error");

              } else {
                console.log("Issue submitted and saved");
                res.json(newIssue);
              }
            }
          )
    });
  })

    .put(function (req, res){
      const project = req.params.project;
      const collection = 'issues';

      const updatedFields = {};
      const notEmpty = value =>(
        value != undefined &
        value != null &
        value != "")

        Object.keys(req.body).forEach(key => {
          if (notEmpty(req.body[key])) {
            if (key=='open') {
              updatedFields[key] != 'false'
            } else {
              updatedFields[key] = req.body[key]
            }
          }
        });

        if(Object.keys(updatedFields).length <= 1) {
          res.send("nothing has been updated");
        } else {
          updatedFields['updated_on'] = new Date();
          delete updatedFields['_id']

          MongoClient.connect(CONNECTION_STRING, function(err, db) {
            db.collection('collection').findAndModify(
              {_id: ObjectId(req.body._id)},
              [],
              { $set: updatedFields}, (err, doc) =>{
                if (err) {
                  console.log(err);
                  res.send("could not update "+req.body._id);
                } else {
                  res.send("Issue successfully updated");
                }
              }
          )
        });
      }
    })

    .delete(function (req, res){
      const project = req.params.project;
      const collection = 'issues';
      if (req.body._id == undefined){
        res.send("error with _id");
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          db.collection('collection').findAndModify({
            _id: ObjectId(req.body._id)},
            {},
            {},
            {remove: true}, (err, doc)=>{
              if (err) {
                console.log(err);
                res.send("could not delete "+req.body._id);
              } else {
                res.send("deleted "+req.body._id);
              }
            });
      });
    }
    });

};
