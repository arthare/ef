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
app.use(bodyParser.urlencoded({limit: '50mb'}));

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
      handleError("Failed to read from DB. ", req, res, err);
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
    if(err) {
      return handleError("Failed to get image for ", tableName, " id = ", id, req, res, err);
    }
    callback(err, results[0].image);
  });
}
function getClassIdOfClassInstance(id, callback) {
  connection.query("select classid from classinstances where id = ?", [id], (err, results, fields, fieldInfo) => {
    callback(err, results && results[0] && results[0].classid);
  });
}

function isInt(i) {
  try {
    parseInt(i);
    return true;
  } catch(e) {
    console.log("failed to parse ", JSON.stringify(i));
    return false;
  }
}
function isFloat(i) {
  try {
    parseFloat(i);
    return true;
  } catch(e) {
    console.log("failed to parse ", JSON.stringify(i));
    return false;
  }
}

app.post('/newlesson', (req, res) => {
  const body = req.body;
  // body has:
  // locationid
  // instructorid
  // classid
  // shortdesc
  // longdesc
  // image
  // starttime
  // lengthseconds
  // price
  if(!isInt(body.locationid)) {
    return handleError("No location provided", req, res, body.locationid);
  }
  if(!isInt(body.instructorid)) {
    console.log("body = ", body);
    return handleError("No instructor provided", req, res, body.instructorid);
  }
  if(!isInt(body.classid)) {
    return handleError("No class provided", req, res, body.classid);
  }
  if(!body.shortdesc || body.shortdesc.length <= 3) {
    return handleError("You need a longer lesson title", req, res, body.shortdesc);
  }
  if(!body.longdesc || body.longdesc.length < body.shortdesc.length) {
    return handleError("Your long description needs to be longer than your title", req, res, body.longdesc);
  }
  if(!body.image || body.image.length <= 0) {
    return handleError("No instructor provided", req, res, body.image);
  }
  if(!isInt(body.starttime) || body.starttime < (new Date().getTime()/1000)) {
    return handleError("Lesson apparently starts in the past?", req, res, body.starttime);
  }
  if(!isInt(body.lengthseconds) || body.lengthseconds < 300) {
    return handleError("Class length is less than 5 minutes?", req, res, body.lengthseconds);
  }
  if(!isInt(body.price) || !body.price) {
    return handleError("No price provided");
  }
  let priceDollars = 0;
  try {
    priceDollars = parseFloat(body.price);
  } catch(e) {
    return handleError("Could not parse price");
  }

  let bufferImage = dataUriToBuffer(body.image);
  console.log("bufferImage = ", bufferImage);
  connection.query("insert into classinstances (locationid,instructorid,classid,shortdesc,longdesc,image,starttime,lengthseconds,pricecents) values (?,?,?,?,?,?,?,?,?)",
                                              [body.locationid, body.instructorid,body.classid, body.shortdesc, body.longdesc, bufferImage, body.starttime, body.lengthseconds, priceDollars*100], (err, results) => {
    if(err) {
      return handleError("Failed to insert new lesson", req, res, err);
    }
    res.send("");
  });
})

app.post('/changeattendance', (req, res) => {
  // body needs to have:
  // userid
  // lessonid
  // rating (can be null)
  // isattending
  const body = req.body;
  if(!body.userid) {
    return handleError("No userid provided", req, res, body);
  }
  if(!body.lessonid) {
    return handleError("No lessonid provided", req, res, body);
  }
  if(!body.rating) {
    body.rating = null;
  }
  if(!body.isattending) {
    return handleError("No isattending provided", req, res, body);
  }
  if(body.isattending !== 'true' && body.isattending !== 'false') {
    return handleError("isattending is malformed", req, res, body);
  }
  body.isattending = (body.isattending && body.isattending == 'true') ? 1 : 0;

  connection.query("insert into attendance (userid, instanceid, isattending,rating) values (?,?,?,?) on duplicate key update isattending=?",
                    [body.userid, body.lessonid, body.isattending, body.rating, body.isattending], (err, results) => {
                      if(err) {
                        return handleError("Error during insertion", req, res, err);
                      }
                      res.send("");
                    });
})

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
  if(!isInt(body.instructorid)) {
    return handleError("No instructor provided", req, res, body);
  }
  if(!isInt(body.locationid)) {
    return handleError("No location provided", req, res, body);
  }
  if(!body.uniquetext) {
    return handleError("No detailed description provided", req, res, body);
  }
  if(!body.image) {
    return handleError("No image provided", req, res, body);
  }
  console.log("They want to make a new class with image size ", req.body.image.length);
  if(!isInt(body.defaultprice)) {
    return handleError("No default price provided", req, res, body);
  }
  let defaultPrice = 0;
  try {
    defaultPrice = parseFloat(body.defaultprice);
  } catch(e) {
    return handleError("Unparseable price provided", req, res, body);
  }

  let bufferImage = dataUriToBuffer(body.image);
  connection.query("insert into classes (name, instructorid, locationid, uniquetext, image, defaultpricecents) values (?,?,?,?,?,?)",
                  [body.name, body.instructorid, body.locationid, body.uniquetext, bufferImage, defaultPrice*100], (err, results) => {
    if(err) {
      return handleError("Error during insertion", req, res, err);
    }
    res.send("");
  })
})
app.post('/newlocation', (req, res) => {
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
  if(!body.description) {
    return handleError("No detailed description provided", req, res, body);
  }
  if(!body.image) {
    return handleError("No image provided", req, res, body);
  }
  if(!isFloat(body.latdegrees) || !isFloat(body.londegrees)) {
    return handleError("No Location Provided", req, res, body);
  }

  let bufferImage = dataUriToBuffer(body.image);
  connection.query("insert into locations (name, description, image, latdegrees, londegrees) values (?,?,?,?,?)",
                  [body.name, body.description, bufferImage, body.latdegrees, body.londegrees], (err, results) => {
    if(err) {
      return handleError("Error during insertion", req, res, err);
    }
    res.send("");
  })
})

app.get('/image/:type/:id', (req, res) => {
  console.log("image request");

  const type = req.params['type'];
  let id = req.params['id'];
  try {
    id = parseInt(id);
  } catch(e) {
    return handleError("Bad id", req, res, req.params['id']);
  }

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

function ass(f) {
  if(!f) {
    throw new Error("Something failed");
  }
}
function validateClassInstance(instance) {

  try {
    
    ass(_.isNumber(instance.id));
    ass(_.isObject(instance.location));
    ass(_.isObject(instance.instructor));
    ass(_.isObject(instance.class));
    ass(_.isString(instance.shortdesc));
    ass(_.isString(instance.longdesc));
    ass(_.isNumber(instance.starttime));
    ass(_.isNumber(instance.lengthseconds));
  } catch(e) {
    console.log(instance, e);
    throw e;
  }

  return instance;
}

app.get('/classschedule/:daysstart/:daysend', (req, res) => {
  res.set('Content-Type', 'application/json');
  
  const secondsInDay = 24*60*60;
  const now = new Date().getTime() / 1000;
  const startTime = now + secondsInDay*req.params.daysstart;
  const endTime = now + secondsInDay*req.params.daysend;
  const userid = req.query.userid;
  if(!userid) {
    return handleError("Needs userid", req, res, req.query);
  }
  connection.query(`SELECT 
                    classinstances.id as _instanceid,
                    locations.id as locationid,
                    locations.name as locationname,
                    instructors.id as instructorid,
                    instructors.name as instructorname,
                    classes.id as classid,
                    classes.name as classname,
                    shortdesc,
                    longdesc,
                    starttime,
                    lengthseconds,
                    (select isattending from attendance where userid=? and instanceid=_instanceid) as isattending
                  FROM
                    classinstances,
                    locations,
                    instructors,
                    classes
                  WHERE
                    classinstances.classid = classes.id
                        AND classinstances.locationid = locations.id
                        AND classinstances.instructorid = instructors.id
                        and starttime >= ? and starttime <= ? order by starttime asc`, [userid, startTime, endTime], (err, results) => {
    let ret = [];
    if(err) {
      return handleError("err", req, res, err);
    }
    results.forEach((result) => {
      ret.push(validateClassInstance({
        id: result._instanceid,
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
        isattending: result.isattending
      }));
    });

    res.send(JSON.stringify(ret));
  });
})

app.get('/classinstance/:instanceid', (req, res) => {
  res.set('Content-Type', 'application/json');
  
  let instanceid = req.params.instanceid;
  if(!instanceid) {
    return handleError("You didn't include an instanceid", req, res, req.params);
  }
  try {
    instanceid = parseInt(instanceid);
  } catch(e) {
    return handleError("Exception while parsing instanceid", req, res, req.params);
  }
  const userid = req.query.userid;
  if(!userid) {
    return handleError("Needs userid", req, res, req.query);
  }

  connection.query(`SELECT 
      classinstances.id as _instanceid,
      locations.id as locationid,
      locations.name as locationname,
      instructors.id as instructorid,
      instructors.name as instructorname,
      classes.id as classid,
      classes.name as classname,
      shortdesc,
      longdesc,
      starttime,
      lengthseconds,
      (select isattending from attendance where userid=? and instanceid=_instanceid) as isattending
    FROM
      classinstances,
      locations,
      classes,
      instructors
    WHERE
          classinstances.locationid = locations.id
          AND classinstances.classid = classes.id
          AND classinstances.instructorid = instructors.id
          AND classinstances.id=?`, [userid, instanceid], (err, results) => {
    if(err) {
      return handleError("Err", req, res, err);
    }
    if(results.length !== 1) {
      return handleError("Result not found", req, res, results);
    }
    const result = results[0];
    const ret = validateClassInstance({
        id: result._instanceid,
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
        isattending: result.isattending
    });

    res.send(JSON.stringify(ret));
  })
})
// finds all instances of a class
app.get("/classinstances/:classid", (req, res) => {
  
  res.set('Content-Type', 'application/json');
  
  connection.query('select id,locationid,instructorid,classid,shortdesc,longdesc,starttime,lengthseconds from classinstances where classid=?', [req.params.classid], (err, results) => {
    let ret = [];
    results.forEach((result) => {
      ret.push({
        id: result.id,
        locationid: result.locationid,
        instructorid: result.instructorid,
        classid: result.classid,
        shortdesc: result.shortdesc,
        longdesc: result.longdesc,
        starttime: result.starttime,
        lengthseconds: result.lengthseconds,
      });
    });

    res.send(JSON.stringify(ret));
  })
})

app.get('/users', (req, res) => {
  res.set('Content-Type', 'application/json');
  connection.query("select id,name from users order by name", [], (err, results) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res, err);
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
})

app.get('/instructors', (req, res) => {
  res.set('Content-Type', 'application/json');
  connection.query("select id,name from instructors order by name", [], (err, results) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res, err);
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
      handleError("Failed to read from DB. ", req, res, err);
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
      handleError("Failed to read from DB. ", req, res, err);
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

  connection.query('select name, uniquetext, id, defaultpricecents from classes where instructorid=?', [req.params.instructorid], (err, results) => {
    res.set('Content-Type', 'application/json');

    let ret = [];
    results.forEach((result) => {
      ret.push({
        id: result.id,
        name: result.name,
        uniquetext: result.uniquetext,
        defaultpricecents: result.defaultpricecents,
      });
    });

    res.send(JSON.stringify(ret));
  });
});
app.get('/pastclasses', (req, res) => {
  res.set('Content-Type', 'application/json');
  const id = req.query.userid;

  connection.query(`SELECT 
                      classinstances.id as instanceid,
                      classes.id as classid,
                      classes.name as classname,
                      classes.uniquetext as classuniquetext,
                      classinstances.id as instanceid,
                      classinstances.shortdesc as instanceshortdesc,
                      classinstances.longdesc as instancelongdesc,
                      classinstances.lengthseconds as lengthseconds,
                      classinstances.starttime as starttime,
                      classinstances.pricecents as price,
                      attendance.rating as rating
                    FROM
                      classes,
                      classinstances,
                      attendance
                    WHERE
                      classes.id = classinstances.classid
                          AND attendance.userid = ?
                          AND classinstances.starttime < unix_timestamp()
                          AND attendance.instanceid = classinstances.id`, [id], (err, results) => {
    var ret = [];
    if(err) {
      return handleError("Failed to query for past classes", req, res, err);
    }

    if(results.length > 0) {
      results.forEach((result) => {
        
        ret.push({
          instanceid: result.instanceid,
          class: {
            id: result.classid,
            name: result.classname,
            uniquetext: result.classuniquetext,
          },
          instance: {
            id: result.instanceid,
            shortdesc: result.instanceshortdesc,
            longdesc: result.instancelongdesc,
            lengthseconds: result.lengthseconds,
            starttime: result.starttime,
            price: result.price,
            rating: result.rating,
          },
        });

        res.send(JSON.stringify(ret));
      })
    } else {
      res.send(JSON.stringify({}));
    }
  });

});

app.post('/rateclass', (req, res) => {
  res.set('Content-Type', 'application/json');

  const body = req.body;
  let rating = body.rating;
  if(!rating) {
    return handleError("No rating given", req, res, body);
  }
  let userid = body.userid;
  if(!userid) {
    return handleError("No userid given", req, res, body);
  }
  let instanceid = body.id;
  if(!instanceid) {
    return handleError("No instanceid given", req, res, body);
  }


  const query = `update attendance set rating=? where userid=? and instanceid=?`;
  connection.query(query, [rating, userid, instanceid], (err, results) => {
    if(err) {
      return handleError("Failed to query", req, res, err);
    }

    res.send("{}");
  })
})
app.get('/classes', (req, res) => {
  const query = `SELECT 
                  locationid,
                  locations.name AS locationname,
                  classes.id AS thisClassId,
                  (SELECT 
                          classinstances.starttime
                      FROM
                          classinstances
                      WHERE
                          classinstances.classid = thisClassId
                              AND starttime > UNIX_TIMESTAMP()
                      ORDER BY starttime ASC
                      LIMIT 1) as nexttime,
                  classes.uniquetext AS uniquetext,
                  classes.name AS name,
                  instructors.name AS instructorname,
                  instructors.id AS instructorid
                FROM
                  classes,
                  instructors,
                  locations
                WHERE
                  instructors.id = classes.instructorid
                      AND locations.id = classes.locationid
                ORDER BY name`;

  connection.query(query, undefined, (err, results, field, fieldInfo) => {
    
    if(err) {
      handleError("Failed to read from DB. ", req, res, err);
      return;
    }
    console.log(results[0]);

    let ret = [];
    results.forEach((result) => {
      ret.push({
        name: result.name,
        id: result.thisClassId,
        nexttime: result.nexttime,
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

app.get('/user/:userid', (req, res) => {

  
  res.set('Content-Type', 'application/json');

  // params[0] is the id they want
  const id = req.params.userid;

  connection.query("select name,moneycents from users where id=?", [id], (err, results, fields, fieldInfo) => {
    if(err) {
      handleError("Failed to read from DB. ", req, res, err);
      return;
    }
    
    // there should only be one result
    if(results.length !== 1) {
      handleError("More than one user with id " + id + "!", req, res);
      return;
    }

    let ret = {};
    ret.name = results[0].name;
    ret.moneystring = '$' + results[0].moneycents / 100;
    ret.moneycents = results[0].moneycents;
    res.send(JSON.stringify(ret));
  });
});

console.log("listening!");
app.listen(3000);