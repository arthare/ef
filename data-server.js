var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var _ = require('lodash');
var bodyParser = require('body-parser');
var dataUriToBuffer = require('data-uri-to-buffer');


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'efitness',
});
connection.connect();

var app = express();
app.use(cors());

function handleError(reason, req, res, extra) {
  console.log(reason, JSON.stringify(extra));
  res.status(500).send(reason + JSON.stringify(extra));
}

app.get('/location/:locationid', (req, res) => {
  res.set('Content-Type', 'application/json');
  
  // params[0] is the id they want
  const id = req.params.locationid;

  connection.query("select name,latdegrees,londegrees,description from locations where id=?", [id], (err, results, fields, fieldInfo) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res);
      return;
    }
    
    // there should only be one result
    if(results.length !== 1) {
      handleError("More than one location with id " + id + "!", req, res);
      return;
    }
    let ret = {};
    ret.name = results[0].name;
    ret.latdegrees = results[0].latdegrees;
    ret.londegrees = results[0].londegrees;
    ret.description = results[0].description;
    res.send(JSON.stringify(ret));
  });
});

function getImageFromTable(tableName, id, callback) {
  connection.query("select image from " + tableName + " where id = ?", [id], (err, results, fields, fieldInfo) => {
    callback(err, results[0].image);
  });
}
function getClassIdOfClassInstance(id, callback) {
  connection.query("select classid from classinstances where id = ?", [id], (err, results, fields, fieldInfo) => {
    callback(err, results && results[0] && results[0].classid);
  });
}
app.use(bodyParser.urlencoded());

app.post('/newclass', (req, res) => {
  // body needs to have:
  //  name
  //  instructorid
  //  locationid
  //  uniquetext
  //  image
  const body = req.body;
  if(!body.name) {
    return handleError("No class name provided", req, res, body);
  }
  if(!body.instructorid) {
    return handleError("No instructor provided", req, res, body);
  }
  if(!body.locationid) {
    return handleError("No location provided", req, res, body);
  }
  if(!body.uniquetext) {
    return handleError("No detailed description provided", req, res, body);
  }
  if(!body.image) {
    return handleError("No image provided", req, res, body);
  }

  let bufferImage = dataUriToBuffer(body.image);
  connection.query("insert into classes (name, instructorid, locationid, uniquetext, image) values (?,?,?,?,?)",
                  [body.name, body.instructorid, body.locationid, body.uniquetext, bufferImage], (err, results) => {
    if(err) {
      return handleError("Error during insertion");
    }
    res.send("");
  })
})

app.get('/image/:type/:id', (req, res) => {
  console.log("image request");

  const type = req.params['type'];
  const id = req.params['id'];


  let tableName = '';
  console.log("type = ", type);
  switch(type) {
    case 'user':
      tableName = 'users';
      break;
    case 'class':
      tableName = 'classes';
      break;
    case 'instructor':
      tableName = 'instructors';
      break;
    case 'location':
      tableName = 'locations';
      break;
    case 'classinstance':
      // this gets more complicated, because we might take the classinstance image if it is available, the class image if it is not
      getImageFromTable('classinstances', id, (err, image) => {
        if(!err && image !== null) {
          res.set('Content-Type', 'image/jpeg');
          res.send(image);
          res.end();
        } else {
          // image not found in the classinstance, use the one in the class.  First, we need to find out the class id
          getClassIdOfClassInstance(id, (err, classid) => {
            getImageFromTable('classes', classid, (err, image) => {
              if(err) {
                handleError("Failed to read image from DB. ", req, res, image);
                return;
              }
              res.set('Content-Type', 'image/jpeg');
              res.send(image);
              res.end();
            });
          })
        }
      })
      return;
    default:
      res.status(403).send();
      break;
  }

  getImageFromTable(tableName, id, (err, image) => {
    res.set('Content-Type', 'image/jpeg');
    res.send(image);
    res.end();
  });
});

app.get('/classschedule/:daysstart/:daysend', (req, res) => {
  res.set('Content-Type', 'application/json');
  
  const secondsInDay = 24*60*60;
  const now = new Date().getTime() / 1000;
  const startTime = now + secondsInDay*req.params.daysstart;
  const endTime = now + secondsInDay*req.params.daysend;

  connection.query(`SELECT 
                    classinstances.id,
                    locations.id as locationid,
                    locations.name as locationname,
                    instructors.id as instructorid,
                    instructors.name as instructorname,
                    classes.id as classid,
                    classes.name as classname,
                    shortdesc,
                    longdesc,
                    starttime,
                    lengthseconds
                  FROM
                    classinstances,
                    locations,
                    instructors,
                    classes
                  WHERE
                    classinstances.classid = classes.id
                        AND classinstances.locationid = locations.id
                        AND classinstances.instructorid = instructors.id
                        and starttime >= ? and starttime <= ?`, [startTime, endTime], (err, results) => {
    let ret = [];
    results.forEach((result) => {
      ret.push({
        id: result.id,
        location: {
          id: result.locationid,
          name: result.locationname,
        },
        instructor: {
          id: result.instructorid,
          name: result.instructorname,
        },
        class: {
          id: result.classid,
          name: result.classname,
        },
        shortdesc: result.shortdesc,
        longdesc: result.longdesc,
        starttime: result.starttime,
        lengthseconds: result.lengthseconds,
      });
    });

    res.send(JSON.stringify(ret));
  });
})
// finds all instances of a class
app.get("/classinstance/:classid", (req, res) => {
  
  res.set('Content-Type', 'application/json');
  
  connection.query('select id,locationid,instructorid,classid,shortdesc,longdesc,starttime,lengthseconds from classinstances where classid=?', [req.params.classid], (err, results) => {
    let ret = [];
    results.forEach((result) => {
      ret.push({
        id: result.id,
        locationid: result.locationid,
        instructorid: result.instructorid,
        classid: result.classid,
        shortdes: result.shortdesc,
        longdesc: result.longdesc,
        starttime: result.starttime,
        lengthseconds: result.lengthseconds,
      });
    });

    res.send(JSON.stringify(ret));
  })
})

app.get('/instructors', (req, res) => {
  res.set('Content-Type', 'application/json');
  connection.query("select id,name from instructors order by name", [], (err, results) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res);
      return;
    }
    
    let ret = _.map(results, (result) => {
      return {
        id: result.id,
        name: result.name,
      };
    });

    res.send(JSON.stringify(ret));
  });
});
app.get('/locations', (req, res) => {
  res.set('Content-Type', 'application/json');
  connection.query("select id,name from locations order by name", [], (err, results) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res);
      return;
    }
    
    let ret = _.map(results, (result) => {
      return {
        id: result.id,
        name: result.name,
      };
    });

    res.send(JSON.stringify(ret));
  });
});

app.get('/instructor/:instructorid', (req, res) => {
  res.set('Content-Type', 'application/json');
  
  connection.query("select id,name,bio from instructors where id=?", [req.params.instructorid], (err, results) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res);
      return;
    }
    
    // there should only be one result
    if(results.length !== 1) {
      handleError("More than one user with id " + id + "!", req, res);
      return;
    }

    let ret = {};
    ret.id = results[0].id;
    ret.name = results[0].name;
    ret.bio = results[0].bio;

    res.send(JSON.stringify(ret));
  });
})

app.get('/instructorclass/:instructorid', (req, res) => {

  connection.query('select name, uniquetext, id from classes where instructorid=?', [req.params.instructorid], (err, results) => {
    res.set('Content-Type', 'application/json');

    let ret = [];
    results.forEach((result) => {
      ret.push({
        id: result.id,
        name: result.name,
        uniquetext: result.uniquetext,
      });
    });

    res.send(JSON.stringify(ret));
  });
});
app.get('/classes', (req, res) => {
  connection.query('select locationid, locations.name as locationname, classes.id as classid, uniquetext, name, instructors.name as instructorname, instructors.id as instructorid from classes,instructors,locations where instructors.id=classes.instructorid and locations.id=classes.locationid order by name', undefined, (err, results, field, fieldInfo) => {
    
    console.log(results[0]);
    if(err) {
      handleError("Failed to read from DB. ", req, res, err);
      return;
    }

    let ret = [];
    results.forEach((result) => {
      ret.push({
        name: result.name,
        id: result.classid,
        location: {
          id: result['locationid'],
          name: result['locationname'],
        },
        instructor: {
          id: result['instructorid'],
          name: result['instructorname'],
        },
      });
    });

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(ret));
  });
})

app.get('/user/*', (req, res) => {

  
  res.set('Content-Type', 'application/json');

  // params[0] is the id they want
  const id = req.params[0];

  connection.query("select name from users where id=?", [id], (err, results, fields, fieldInfo) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res);
      return;
    }
    
    // there should only be one result
    if(results.length !== 1) {
      handleError("More than one user with id " + id + "!", req, res);
      return;
    }

    let ret = {};
    ret.name = results[0].name;
    res.send(JSON.stringify(ret));
  });
});

console.log("listening!");
app.listen(3000);