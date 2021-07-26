let print = (...args) => {
  console.log(args);
}


let express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  localStratergy = require('passport-local'),
  expressSession = require('express-session'),
  passportLocalMongoose = require('passport-local-mongoose');
let nodemailer = require('nodemailer');
let methodOverride = require("method-override");

let multer = require('multer');
const dotenv = require('dotenv');
let fs = require('fs')
let path = require('path')
app = express();
let JSAlert = require('js-alert');
let { title } = require('process');

dotenv.config({ path: './config.env' });//ab hum process.env ko khi par bhi use kar skte hai

//agora


let appID = process.env.APPID;

const userRoutes = require('./routes/users');

require('./dbs/connect');
let User = require('./models/user');
let reminder = require('./models/reminder');
let Event = require('./models/event');


let PORT = process.env.PORT || 3000;

app.use(methodOverride("_method"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));


app.use(
  expressSession({
    secret: 'hackmol it it',
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(userInfo);


passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



function userInfo(req, res, next) {
  res.locals.currentUser = req.user;
  next();
}

const validate = (req, res, next) => {

  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};



//Mail system
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmailid,
    pass: process.env.gmailpassword,
  },
});

//Reminder Code
setInterval(function () {
  let dat = new Date();

  reminder.find(
    {
      'date.day': dat.getDate(),
      'date.month': dat.getMonth() + 1,
      'date.year': dat.getFullYear(),
      'time.hr': { $lte: dat.getHours() + 1 },
    },
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        //send an email to persons in array of result

        for (let i = 0; i < result.length; i++) {
          User.findOne({ username: result[i].username }, function (err, res) {
            if (err) console.log(err);
            else {
              console.log(res);
              let mailoptions = {
                from: process.env.gmailid,
                to: res.email,
                subject: 'Hobby Matcher Reminder',
                text: `Hi  ${res.name}. Your reminder is up for today at Hrs: ${result[i].time.hr}, Min:${result[i].time.min} for the event titled  ${result[i].title}`,
              };
              transporter.sendMail(mailoptions, function (err, resp) {
                if (err) console.log(err);
                else console.log('Email sent' + resp.response);
              });
            }
          });
          //delete that reminder with the help of id of the record found
          reminder.deleteOne({ _id: result[i]._id }, function (per, pes) {
            if (per) console.log(per);
          });
        }
      }
    }
  );
}, 120);




app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('index');
});


app.get('/cancelreq/:id/:let', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  User.findByIdAndUpdate(req.user._id, { $pull: { sentreq: req.params.id } }, function (err) {
    if (err)
      return console.log(err)
  })
  User.findByIdAndUpdate(req.params.id, { $pull: { receivereq: req.user._id } }, function (err) {
    if (err)
      return console.log(err)
  })
  res.redirect("back")
})
app.get('/hobbie/:type', validate, function (req, response) {
  // if (!req.isAuthenticated()) {
  //   return response.redirect('/login');
  // }
  User.findById(req.user._id, function (err, res) {
    if (err)
      return console.log(err.message)
    let x;
    if (res.hobbies.indexOf(req.params.type) != -1)
      x = true;
    else
      x = false;
    let people = new Array()
    let latitudeofuser = res.latitude;
    let longitudeofuser = res.longitude;
    let dis = 10;



    User.find({}, function (errr, re) {
      if (errr)
        return console.log(errr)

      let count = 0;
      re.forEach(function (thisuser) {
        count++;

        let lati = thisuser.latitude;
        let long = thisuser.longitude;

        let lat1 = toRadians(lati);
        let long1 = toRadians(long);
        let lat2 = toRadians(latitudeofuser);
        let long2 = toRadians(longitudeofuser);
        let dlong = long2 - long1;
        let dlat = lat2 - lat1;
        let ans =
          Math.pow(Math.sin(dlat / 2), 2) +
          Math.cos(lat1) *
          Math.cos(lat2) *
          Math.pow(Math.sin(dlong / 2), 2);
        ans = 2 * Math.asin(Math.sqrt(ans));
        let R = 6371;
        ans = ans * R;

        if (ans <= dis && thisuser.username != req.user.username && thisuser.hobbies.indexOf(req.params.type) != -1) {
          people.push(thisuser);
        }
        if (count === re.length)
          response.render('hobbie', { hname: req.params.type, people: people, x: x, currentuser: res });
      })

    })

  })


})



app.get('/mainpage', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  res.render('mainpage')
})
app.get('/addhobbie/:type', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  User.findById(req.user._id, function (err, result) {
    if (err)
      return console.log(err.message)
    console.log(result);
    result.hobbies.push(req.params.type);
    result.save();
    res.redirect('/hobbie/' + req.params.type)
  })
})
app.get('/rejectreq/:id/:let', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  User.findByIdAndUpdate(req.user._id, { $pull: { receivereq: req.params.id } }, function (err) {
    if (err)
      return console.log(err)
  })
  User.findByIdAndUpdate(req.params.id, { $pull: { sentreq: req.user._id } }, function (err) {
    if (err)
      return console.log(err)
  })
  res.redirect("back");
})
app.get('/acceptreq/:id/:let', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }

  User.findByIdAndUpdate(req.user._id, { $pull: { receivereq: req.params.id } }, function (err) {
    if (err)
      return console.log(err.message)
  })
  User.findByIdAndUpdate(req.params.id, { $pull: { sentreq: req.user._id } }, function (err) {
    if (err)
      return console.log(err.message)
  })

  User.findById(req.user._id, function (err, user1) {
    if (err)
      return console.log(err.message)
    User.findById(req.params.id, function (err, user2) {
      if (err)
        return console.log(err.message)
      user1.friend.push(req.params.id)
      user1.save()
      user2.friend.push(req.user._id)
      user2.save()
      res.redirect("back");


    })

  })

})
app.get('/friends', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  User.findById(req.user._id)
    .populate('friend')
    .exec(function (err, friends) {
      if (err) console.log(err);
      // else console.log(friends);
      User.findById(req.user._id)
        .populate('receivereq')
        .exec(function (err, pendingreq) {
          if (err) return console.log(err);
          else console.log("dpefde", pendingreq.receivereq);
          res.render('friends', { friends: friends.friend, pending: pendingreq.receivereq });
        });
    });
});
app.get('/addfriendreq/:id/:let', validate, function (req, response) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  User.findById(req.user._id, function (err, res) {
    if (err) return console.log(err);
    User.findById(req.params.id, function (err, resp) {
      if (err) return console.log(err);
      res.sentreq.push(resp);
      res.save();
      resp.receivereq.push(res);
      resp.save();
      response.redirect('back');
    });
  });
});



app.get("/video/:id", function (req, res) {
  let channelName = req.user.username;
  User.findById(req.params.id, function (err, foundUser) {
    if (err || !foundUser) {
      console.log("User not found");
      return res.redirect("back");
    }
    if (channelName.localeCompare(foundUser.username) < 0)
      channelName = channelName + foundUser.username;
    else
      channelName = foundUser.username + channelName;
    console.log(channelName);
    console.log(foundUser);
    res.render("video", { appID: appID, channelName: channelName, localUser: req.user, remoteUser: foundUser });
  })
})

app.get('/addreminder', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  reminder
    .find({ username: req.user.username }, function (err, result) {
      if (err) console.log(err);
      else {
        res.render('reminder', { result: result });
      }
    })
    .sort([
      ['date.year', 'asc'],
      ['date.month', 'asc'],
      ['date.day', 'asc'],
      ['time.hr', 'asc'],
      ['time.min', 'asc'],
    ]);
});

app.post('/addreminder', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }

  let dat = new Date();
  let y = dat.getFullYear();
  let m = dat.getMonth() + 1;
  let d = dat.getDate();
  let h = dat.getHours();
  let min = dat.getMinutes();

  let year = parseInt(req.body.Date.slice(0, 4));
  let month = parseInt(req.body.Date.slice(5, 7));
  let date = parseInt(req.body.Date.slice(8, 10));
  let hour = parseInt(req.body.Time.slice(0, 2));
  let mi = parseInt(req.body.Time.slice(3, 5));

  if (
    year < y ||
    (year == y && month < m) ||
    (year == y && month == m && date < d) ||
    (year == y && month == m && date == d && hour * 60 + mi < h * 60 + min + 30)
  ) {
    JSAlert.alert(
      'Your files have been saved successfully.',
      'Files Saved',
      'Got it'
    );
    return res.redirect('/addreminder');
  }

  let inst1 = new reminder({
    username: req.user.username,
    title: req.body.Title,
    Description: req.body.Description,
    date: { day: date, month: month, year: year },
    time: { hr: hour, min: mi },
  });
  inst1.save(function (err) {
    if (err) return console.error(err);
    console.log('Saved to Resource');
  });
  res.redirect('/addreminder');
});

app.get('/delete/:id', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }

  reminder.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return console.log(err);
    // deleted at most one tank document
    res.redirect('/addreminder');
  });
});
function toRadians(degree) {
  let one_deg = Math.PI / 180;
  return one_deg * degree;
}

app.get('/users', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }

  let usersuptodis = new Array();
  let latitudeofuser;
  let longitudeofuser;
  let dis = 10;
  User.findOne({ username: req.user.username }, function (err, result) {
    if (err) console.log(err);
    else {
      latitudeofuser = result.latitude;
      longitudeofuser = result.longitude;
      User.find({}, function (err, users) {
        if (err) {
          console.log(err);
        } else {
          let count = 0;
          users.forEach(function (thisuser) {
            count++;

            let lati = thisuser.latitude;
            let long = thisuser.longitude;

            let lat1 = toRadians(lati);
            let long1 = toRadians(long);
            let lat2 = toRadians(latitudeofuser);
            let long2 = toRadians(longitudeofuser);
            let dlong = long2 - long1;
            let dlat = lat2 - lat1;
            let ans =
              Math.pow(Math.sin(dlat / 2), 2) +
              Math.cos(lat1) *
              Math.cos(lat2) *
              Math.pow(Math.sin(dlong / 2), 2);
            ans = 2 * Math.asin(Math.sqrt(ans));
            let R = 6371;
            ans = ans * R;

            if (ans <= dis && thisuser.username != req.user.username) {
              usersuptodis.push(thisuser);
            }
            if (count === users.length) {
              User.findById(req.user._id, function (per, pes) {
                if (per)
                  return console.log(per.message)

                res.render('users', { result: usersuptodis, currentuser: pes });


              })

            }
          });
        }
      });
    }
  });
});
// app.get("/users/:id",function(req,res){
//   if (!req.isAuthenticated()) {
//     return res.redirect('/login');
//   }
//   User.findById(req.params.id,function(err,user){
//       if(err){console.log(user);}
//       else {
//           res.render("show",{user:user});
//       }
//   })
// })
// app.get("/users/:id/events",function(req,res){
//   User.findById(req.params.id).populate("events").exec(function(err,foundUser){
//       let events = foundUser.events;
//           console.log(events);
//         res.render("registeredEvents",{events:events});
//   })
// })

app.post('/users', validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  let dis = parseInt(req.body.distances);

  let usersuptodis = new Array();
  let latitudeofuser;
  let longitudeofuser;
  User.findOne({ username: req.user.username }, function (err, result) {
    if (err) console.log(err);
    else {
      latitudeofuser = result.latitude;
      longitudeofuser = result.longitude;
      User.find({}, function (err, users) {
        if (err) {
          console.log(err);
        } else {
          let count = 0;
          users.forEach(function (thisuser) {
            count++;

            let lati = thisuser.latitude;
            let long = thisuser.longitude;

            let lat1 = toRadians(lati);
            let long1 = toRadians(long);
            let lat2 = toRadians(latitudeofuser);
            let long2 = toRadians(longitudeofuser);
            let dlong = long2 - long1;
            let dlat = lat2 - lat1;
            let ans =
              Math.pow(Math.sin(dlat / 2), 2) +
              Math.cos(lat1) *
              Math.cos(lat2) *
              Math.pow(Math.sin(dlong / 2), 2);
            ans = 2 * Math.asin(Math.sqrt(ans));
            let R = 6371;
            ans = ans * R;

            if (ans <= dis && thisuser.username != req.user.username) {
              usersuptodis.push(thisuser);
            }
            if (count === users.length) {
              User.findById(req.user._id, function (per, pes) {
                if (per)
                  return console.log(per.message)
                res.render('users', { result: usersuptodis, currentuser: pes });

              })

            }
          });
        }
      });
    }
  });
});

app.get("/chat/:id", validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  let channelName = req.user.username;
  User.findById(req.params.id, function (err, foundUser) {
    if (err || !foundUser) {
      console.log("User not found");
      return res.redirect("back");
    } else {


      res.render("chat", { channelName: channelName, localUser: req.user, remoteUser: foundUser })
    }
  })
})

let montharr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

app.get("/events", validate, (req, res) => {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  Event.find({}, function (err, events) {
    if (err)
      console.log(err);
    else
      res.render("events", { events: events, montharr: montharr });
  }).sort([
    ['date.year', 'asc'],
    ['date.month', 'asc'],
    ['date.day', 'asc'],
    ['time.hr', 'asc'],
    ['time.min', 'asc'],
  ]);
});


app.get("/events/new", function (req, res) {
  res.render("newEvent");
});


app.post("/events", function (req, res) {
  let event = req.body.event;
  console.log(req.body.date);
  let year = parseInt(req.body.date.slice(0, 4));
  let month = parseInt(req.body.date.slice(5, 7));
  let day = parseInt(req.body.date.slice(8, 10));
  let hr = parseInt(req.body.time.slice(0, 2));
  let min = parseInt(req.body.time.slice(3, 5));
  console.log(year, month, day);
  event.date = { day, month, year };
  event.time = { hr, min };
  event.maxCount = parseInt(event.maxCount) + 5;
  if (!event.image) {
    console.log("No image");
  }
  event.author = {
    username: req.user.username,
    id: req.user._id
  };
  Event.create(event, function (err, event) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/events");
    }
  })
})

app.post("/events/:id/registered", function (req, res) {
  Event.findById(req.params.id, function (err, foundEvent) {
    if (err) {
      console.log(err);
    } else {
      console.log("register");
      foundEvent.registered.push(req.user);
      foundEvent.save();
      User.findById(req.user._id, function (err, foundUser) {
        if (err) console.log(err);
        else {
          foundUser.events.push(foundEvent);
          foundUser.save();
          res.redirect("/events");
        }
      })
    }
  })
})
app.post("/events/:id/unregistered", validate, function (req, res) {
  Event.findByIdAndUpdate(req.params.id, { $pull: { registered: req.user._id } }, function (err) {
    if (err) {
      console.log(err);
    } else {
      User.findByIdAndUpdate(req.user._id, { $pull: { events: req.params.id } }, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/events");
        }
      })
    }
  })
})
app.delete("/events/:id", validate, function (req, res) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login');
  // }
  console.log("delete");

  Event.findById(req.params.id, function (err, foundEvent) {
    if (err)
      console.log(err);
    else {
      foundEvent.registered.forEach(function (id) {
        User.findByIdAndUpdate({ _id: id }, { $pull: { events: req.params.id } }, function (err) {
          if (err)
            console.log(err);
        })
      })
    }
  })

  Event.findByIdAndRemove(req.params.id, function (err) {
    if (err) console.log(err);
    else {
      res.redirect("/events");
    }
  })
})



app.get('*', (req, res) => {
  res.status(404).render('notFound');
});

// print(PORT);

app.listen(PORT, function () {
  console.log(`App has started ${PORT}`);
});
