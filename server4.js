// IMPORT MONGODB AND SOCKET.IO


const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);

// FUNCTIONS
const { initPopup, checkUrl, changeUrlStatus, statusChanged, likeKoshGr, removeKoshGr, removeKosh, copyMine, copyGr, input, connected, getGroupes, room } = require('./js/actions/actions');

const { newGroup, joinGroup, searchGroups, changeStatusGroup, deleteGroup } = require('./js/actions/groups');

const { addNewDossier, changeDossier} = require('./js/actions/folder');

const { searchAll, searchMine, searchKoshGroups } = require('./js/actions/search');
/*

  let serv = http.createServer({}, (req, res) => {
    res.writeHead(200);
    console.log('server started');

    }).listen(3000);

*/

/*app.get('/', function(req, res) {
  res.send('fdp');
});*/

const server = http.listen(3000, function() {
  console.log('listening on *:3000');

  const client = require('socket.io').listen(server).sockets;

  mongo.connect('mongodb+srv://Regain:Regain1992@koshcluster.eqzvk.gcp.mongodb.net/kosh', {useUnifiedTopology: true},function(err, clientdb){
  //mongo.connect('mongodb://127.0.0.1:27017/kosh/',{useUnifiedTopology: true}, function(err, clientdb){
    let db = clientdb.db('kosh');


    if (err) {
      throw err;
    }
    console.log('MongoDb connected');


    // CONNECT TO SOCKETS
    client.on('connection', function (socket) {
      // INIT EACH TABLE OF THE DATABASE IN A JS VARIABLE
      let kosh = db.collection('kosh');
      let users = db.collection('users');
      let groupes = db.collection('groupes');
      let kosh_gr = db.collection('kosh_gr');

      console.log('connect')

      //INIT POPUP

      initPopup(socket, users, groupes, kosh, kosh_gr, mongoose);

      // CHECK IF URL IS DISABLED OR NOT

      checkUrl(socket, users);

      // CHANGE URL STATUS

      changeUrlStatus(socket, users);

      // EMIT LES GROUPES DU USER POUR l'URL DE LA PAGE

      getGroupes(socket, users);

      // JOIN TOUTES LES ROOMS DU USER

      room(socket, client, kosh_gr, mongoose);

      // UPDATE USER STATUS

      statusChanged(socket, users);


      ////////////////////  GROUP ACTIONS  ////////////////////

      // CREATE NEW GROUP

      newGroup(socket, groupes, users);

      // JOIN A GROUP

      joinGroup(socket, users, groupes, mongoose);

      // CHANGE STATUS GROUP

      changeStatusGroup(socket, users);

      // REFRESH GROUPS SECTION

     // refreshGroups(socket, users, groupes, kosh, kosh_gr);

      // DELETE GROUP

      deleteGroup(socket, users);



      ////////////////////   DOSSIER ACTIONS   ////////////////////
      // ADD NEW DOSSIER

      addNewDossier(socket, groupes, mongoose);

      // CHANGE DOSSIER

      changeDossier(socket, users);


      ////////////////////   SEARCH ACTIONS   ////////////////////
      // SEARCH FROM ALL USERS

      searchAll(socket, kosh);

      // SEARCH YOUR KOSH

      searchMine(socket, kosh);

      // SEARCH GROUPES

      searchGroups(socket, groupes);

      // SEARCH KOSH FROM GROUPES

      searchKoshGroups(socket, users, kosh_gr, mongoose);



      // ADD LIKE ON TEXT IN KOSH GROUPE

      likeKoshGr(socket, kosh_gr, mongoose);

      // REMOVE LIKE ON TEXT IN KOSH GROUPE

      removeKoshGr(socket, kosh_gr, mongoose);

      // DELETE MY KOSH

      removeKosh(socket, kosh, kosh_gr);


      // COPY // COPY YOUR KOSH??
      copyMine(socket, kosh);


      // COPY GROUP'S KOSH??

      copyGr(socket, users, kosh_gr);

      // NEW CONNECTION FROM CLIENT

      connected(socket, kosh);

      // WHEN USER UNDERLINE SOMETHING --> QUAND QUELQU'UN KOSH QQCH

      input(socket, client, kosh, users, kosh_gr, mongoose);



    });


  })

});


//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////         KOSH          /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


/*

// IMPORT MONGODB AND SOCKET.IO
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http');


  // CONNECT TO MONGODB DATABASE

  const options = {
  
  };
  console.log('lets_go');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


  var server = http.createServer(options, function (req, res) {
    const client = require('socket.io').listen(server).sockets;

    res.writeHead(200);
//mongo.connect('mongodb://127.0.0.1:27017/kosh/',{useUnifiedTopology: true}, function(err, clientdb){
    //mongo.connect('mongodb+srv://HandyMan:JPPDMJJPDMB@kosh-lxq52.mongodb.net/test?retryWrites=true&w=majority', {useUnifiedTopology: true}, function (err, clientdb) {

    mongo.connect('mongodb+srv://Regain:Regain1992@koshcluster.eqzvk.gcp.mongodb.net/kosh', {useUnifiedTopology: true}, function (err, clientdb) {
    //mongo.connect('mongodb://koshcluster.eqzvk.gcp.mongodb.net:27017/kosh',{useUnifiedTopology: true}, function(err, clientdb){

      //console.log('db--------->',clientdb)
      var db = clientdb.db('kosh');


      if (err) {
        throw err;
      }
      console.log('MongoDb connected');

      // CONNECT TO SOCKETS
      client.on('connection', function (socket) {
        // INIT EACH TABLE OF THE DATABASE IN A JS VARIABLE
        let kosh = db.collection('kosh');
        let users = db.collection('users');
        let groupes = db.collection('groupes');
        let kosh_gr = db.collection('kosh_gr');


        //CHECK IF URL IS DISABLE OF NOT
        socket.on('check_url', (data) => {

          users.find({user: data.id}).limit(1).toArray(function (err, res) {
            // console.log("RESSSS----->", res);
            if (res == undefined || !res.length) {
              // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
              users.insertOne({user: data.id, status: 1, groupes: [], url_rm: []}, function () {
                console.log('user added');
              })
            }
            let url_find = 0;
            for (let x = 0; x < res[0].url_rm.length; x++) {
              if (data.url.indexOf(res[0].url_rm[x]) != -1) {
                url_find = 1;
                break;
              }
            }
            if (url_find == 0) {
              socket.emit('url_checked');
            } else {
              socket.emit('url_on');


            }
          })
        })

        // CHANGE URL STATUS

        socket.on('change_url_status', (data) => {
          console.log('change_url')
          users.find({user: data.user}).limit(1).toArray(function (err, res) {
            if (res.length > 0) {
              let new_url_on = [];
              let url_find = 0;
              for (let x = 0; x < res[0].url_rm.length; x++) {
                if (data.url.indexOf(res[0].url_rm[x]) == -1) {
                  new_url_on.push(res[0].url_rm[x]);
                } else {
                  url_find = 1;
                }
              }
              if (url_find == 0 || data.on == 1) {
                let url_to_split = data.url.split('//')[1];
                let new_url = url_to_split.split('/')[0];
                console.log(new_url_on, 'db-->url', new_url)
                new_url_on.push(new_url);
                console.log(new_url_on)
              }


              users.updateOne({'user': data.user}, {$set: {'url_rm': new_url_on}})
            }
          })


        });

        // INIT OF POPUP.HTML ---> data = id of client
        socket.on('init_popup', (data) => {
          // FIND USER WHO REQUESTED INFORMATIONS
          users.find({user: data}).limit(1).toArray(function (err, res) {
            if (res == undefined || !res.length) {
              // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
              users.insertOne({user: data.id, status: 1, groupes: [], url_rm: []}, function () {
                console.log('user added');
              })
            }
            let obj_gr_user = {};
            let tab_name_gr = [];
            let tab_kosh_gr = [];
            // HANDLE THE GROUPS OF USER
            for (let x = 0; x < res[0].groupes.length; x++) {
              // SELECT GROUPS OF USER IN DATABASE
              groupes.find({_id: res[0].groupes[x].id}).limit(1).toArray(function (errr, rep) {

                obj_gr_user = {
                  id: rep[0]._id,
                  name: rep[0].name,
                  description: rep[0].description,
                  public: rep[0].public,
                  contributor: rep[0].contributor,
                  dossier: rep[0].dossier
                };
                tab_name_gr.push(obj_gr_user);
                console.log('EN TRAVAIL --->', tab_name_gr)
                // SELECT TEXTS KOSHED FROM GROUPES
                if (res[0].groupes[x].dossier != undefined) {
                  console.log('TRAVAIL0');
                  if (res[0].groupes[x].dossier.toLowerCase() != 'all') {
                    kosh_gr.find({$and: [{gr: res[0].groupes[x].id}, {dossier: res[0].groupes[x].dossier}]}).sort({_id: -1}).limit(10).toArray(function (error_kosh_gr, res_kosh_gr) {


                      tab_kosh_gr.push(res_kosh_gr);
                      // EMIT TO CLIENT IN THE LAST ITERATION

                      if (x == res[0].groupes.length - 1) {

                        // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                        socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                        console.log('TRAVAIL1');
                      }

                    })
                  } else {
                    kosh_gr.find({gr: res[0].groupes[x].id}).sort({_id: -1}).limit(10).toArray(function (error_kosh_gr, res_kosh_gr) {


                      tab_kosh_gr.push(res_kosh_gr);
                      // EMIT TO CLIENT IN THE LAST ITERATION
                      if (x == res[0].groupes.length - 1) {

                        // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                        socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                        console.log('TRAVAIL2');
                      }

                    })

                  }
                }


              })
            }

          })
          // INIT MY ACTIVITY
          kosh.find({user: data}).sort({_id: -1}).limit(10).toArray(function (err, res) {
            socket.emit('init_activity', res);
          })
        })

        // EMIT LES GROUPES DU USER POUR l'URL DE LA PAGE
        socket.on('get_groupes', (data) => {
          users.find({user: data.id}).limit(1).toArray(function (err, res) {
            socket.emit('rep_groupes', res);
          })
        })
        // JOIN TOUTES LES ROOMS DU USER
        socket.on('room', function (data) {
          socket.join(data.room);
          let id_room = mongoose.Types.ObjectId(data.room);
          kosh_gr.find({$and: [{gr: id_room}, {url: data.url}, {dossier: data.dossier}]}).limit(50).toArray(function (err, res) {
            client.in(data.room).emit('msg_grp', res);
          })
        });

        // CHANGEMENT DE DOSSIER (EN TEST)

        socket.on('change_dossier', (data) => {
          // SELECT USER FROM DATABASE
          users.find({$and: [{user: data.id}]}).limit(1).toArray(function (err, res) {
            if (res.length) {
              //UPDATE STATUS IN USER TABLE
              users.updateOne({'user': data.id, 'groupes.status': 1}, {$set: {"groupes.$.dossier": data.dossier}})
              console.log('dossier updated');
              // socket.emit('rep_dossier_changed', data.dossier);
            } else {
              // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
              users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []}, function () {
                console.log('user added');
              })
            }
          })
        })

        // FIN DU TEST

        // UPTDATE STATUS
        socket.on('status_changed', (data) => {
          // SELECT USER FROM DATABASE
          users.find({$and: [{user: data.id}]}).limit(1).toArray(function (err, res) {
            if (res.length) {
              //UPDATE STATUS IN USER TABLE
              users.updateOne({'user': data.id}, {$set: {'status': data.status_value}})
              console.log('user updated');
              socket.emit('rep_status_changed', data.status_value);
            } else {
              // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
              users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []}, function () {
                console.log('user added');
              })
            }
          })
        })

        // CREATE A NEW GROUP
        socket.on('new_groupe', (data) => {
          // INSERT INTO GROUPS DATABASE
          groupes.insertOne({
            name: data.name,
            description: data.description,
            lien: [],
            public: data.span_1,
            contributor: data.span_2,
            id_user: data.id,
            dossier: ['All', 'General']
          }, function (err, res) {
            console.log('groupe added');
            // UPDATE THE GROUPS OF THE CONCERN USER
            users.updateOne({'user': data.id}, {$push: {groupes: {id: res.ops[0]._id, status: 1, dossier: "all"}}})
            // SEND A INIT BACK FOR THE POPUP
            socket.emit('init_back');
          })

        })

        // JOIN A GROUPE
        socket.on('join_group', (data) => {
          let id_grp = mongoose.Types.ObjectId(data.id_group);
          users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
            let tab_gr = res[0].groupes;
            let gr_found = 0;
            for (let x = 0; x < res[0].groupes.length; x++) {
              if (res[0].groupes[x].id == data.id_group) {
                gr_found = 1;
                break;
              }
            }
            if (gr_found == 0) {
              users.updateOne({'user': data.id_client}, {$push: {groupes: {id: id_grp, status: 1, dossier: "all"}}})
              console.log('group join')
              socket.emit('init_back');
            } else {
              console.log('deja dans le groupe');
            }
          })

        })

        // CHANGE STATUS OF GROUPE
        socket.on('changed_status_gr', (data) => {

          users.find({user: data.id}).limit(1).toArray(function (err, res) {
            let tab_gr_final = [];
            let obj_gr = {};
            for (let x = 0; x < res[0].groupes.length; x++) {
              if (res[0].groupes[x].id == data.id_gr) {
                let status_final = 0;
                if (res[0].groupes[x].status == 1) {
                  status_final = 0;
                } else {
                  status_final = 1;
                }
                obj_gr = {id: res[0].groupes[x].id, status: status_final, dossier: "all"};
              } else {
                obj_gr = {id: res[0].groupes[x].id, status: 0, dossier: "all"};
              }

              tab_gr_final.push(obj_gr);
            }
            users.updateOne({'user': data.id}, {$set: {groupes: tab_gr_final}}, function (err, res) {
              socket.emit('init_back');
            });
          })

        })

        // DELETE GROUPE

        socket.on('delete_gr', (data) => {
          users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
            let tab_gr_final = [];

            for (let x = 0; x < res[0].groupes.length; x++) {
              if (res[0].groupes[x].id != data.id_gr) {
                let obj_gr = {id: res[0].groupes[x].id, status: res[0].groupes[x].status, dossier: "all"};
                tab_gr_final.push(obj_gr);
              }
            }

            users.updateOne({'user': data.id_client}, {$set: {groupes: tab_gr_final}}, function (err, res) {
              socket.emit('init_back');

            });


          })
        });

        // DELETE MY KOSH

        socket.on('remove_kosh', (data) => {
          // kosh.deleteOne( {$and:[ {url:data.url},{texte:data.texte},{user:data.id_user} ]} );
          kosh.deleteMany({url: data.url, texte: data.texte, user: data.id_user});
          kosh_gr.deleteMany({url: data.url, texte: data.texte, user: data.id_user});

        })

        socket.on('remove_kosh_gr', (data) => {
          let id_grp = mongoose.Types.ObjectId(data.gr);
          kosh_gr.find({$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]}).toArray(function (err, res) {
            if (res.length) {
              console.log('OLA', res[0].point)
              let nbr_like = res[0].point - 1;
              if (nbr_like < 1) {
                console.log('HALO', res[0].point)
                kosh_gr.deleteOne({_id: res[0]._id});
              } else {
                kosh_gr.updateOne(
                  {_id: res[0]._id},
                  {$set: {point: nbr_like}}
                );
              }
            }
          })

        })

        socket.on('like_kosh_gr', (data) => {

          let pt = data.point + 1;
          let id_grp = mongoose.Types.ObjectId(data.gr);

          kosh_gr.updateOne(
            {$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]},
            {$set: {point: pt}}
          );


        })


        // COPY

        socket.on('copy_mine', (data) => {
          console.log(data)
          if (data != undefined && data != null) {
            kosh.find({$and: [{url: data.url}, {user: data.user}]}).limit(100).sort({_id: 1}).toArray(function (err, res) {
              socket.emit('copy_mine', res);
            })
          }

        })

        socket.on('copy_gr', (data) => {
          if (data != undefined && data != null) {
            console.log(data.user)
            //let id_user_1 = mongoose.Types.ObjectId(data.user.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            users.find({user: data.user}).limit(100).sort({_id: 1}).toArray(function (err, res) {
              if (res) {
                console.log(res)
                for (let y = 0; y < res[0].groupes.length; y++) {
                  if (res[0].groupes[y].status == 1) {
                    kosh_gr.find({$and: [{url: data.url}, {gr: res[0].groupes[y].id}]}).sort({_id: -1}).toArray(function (err, res) {
                      socket.emit('copy_gr', res);
                    })
                  }
                }
              }
            })
          }
        })

        // SEARCH GROUPES

        socket.on('get_gr_search', (data) => {

          var replace = data.search;
          var re = new RegExp(replace, "g");
          groupes.find({name: re}).limit(100).sort({_id: 1}).toArray(function (err, res) {
            socket.emit('result_gr_search', res);
          })
        })


        // YOUR KOSH
        socket.on('search_mine', (data) => {
          console.log(data)
          kosh.find({$and: [{last_search: data.last_search}, {user: data.id_client}]}).limit(100).sort({_id: 1}).toArray(function (err, res) {

            socket.emit('result_search', res);
          })
        })

        // SEARCH FROM ALL USERS

        socket.on('search_all', (data) => {
          console.log(data)
          kosh.find({last_search: data}).limit(100).sort({_id: 1}).toArray(function (err, res) {

            socket.emit('result_search', res);
          })
        })

        // SEARCH KOSH FROM GROUPES
        socket.on('search_gr', (data) => {
          users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
            // console.log(res)
            for (let x = 0; x < res[0].groupes.length; x++) {
              if (res[0].groupes[x].status == 1) {
                let id_grpe = mongoose.Types.ObjectId(res[0].groupes[x].id);
                kosh_gr.find({$and: [{last_search: data.last_search}, {gr: id_grpe}]}).sort({_id: -1}).toArray(function (err, res) {
                  socket.emit('result_search', res);
                })
              }
            }
          })
        })

        // NEW CONNECTION FROM CLIENT
        socket.on('connected', function (data) {


          // Get texte underlined from mongo collection

          kosh.find({$and: [{url: data.url}]}).limit(50).sort({_id: 1}).toArray(function (err, res) {

            if (err) {

              throw err;
            }

            // Emit the messages

            socket.emit('output', res);
          });

        })


        // WHEN USER UNDERLINE SOMETHING --> QUAND QUELQU'UN KOSH QQCH
        socket.on('input', function (data) {
          console.log('Msg recu');

          // variables recues par les sockets
          let url = data.url;
          let texte = data.texte;
          let div = data.div;
          let user = data.user;
          let last_search = data.last_search;
          let page = data.page;
          console.log(page)

          // Insert message
          // ON SUPPRIME LES DOUBLONS
          kosh.deleteMany({url: url, user: user, texte: texte});


          kosh.insertOne({
            url: url,
            texte: texte,
            div: div,
            user: user,
            last_search: last_search,
            page: page
          }, function (err, res) {
            socket.emit('output', res.ops);
            // socket.broadcast.emit('output', res.ops);


            users.find({user: user}).limit(1).sort({_id: 1}).toArray(function (err, res) {

              if (res[0]) {
                let user_gr = res[0].groupes;

                for (let y = 0; y < user_gr.length; y++) {
                  if (user_gr[y].status == 1) {
                    console.log('etape 1');
                    // ON SUPPRIME LES DOUBLONS DES GROUPES
                    kosh_gr.deleteMany({url: url, user: user, texte: texte});

                    kosh_gr.insertOne({
                      url: url,
                      texte: texte,
                      div: div,
                      gr: user_gr[y].id,
                      last_search: last_search,
                      user: user,
                      point: 1,
                      page: page,
                      dossier: user_gr[y].dossier
                    }, function (err, res) {
                      socket.join('groupe1');
                      client.to('groupe1').emit('test_room', {test: 'ca marche pour la room'});

                      //socket.emit('output_gr', res.ops);
                      // socket.broadcast.emit('output_gr', res.ops);
                    })
                  }
                }
              }
            })
          })

        });


      });
    })
res.end("REPONSES KOSH");
}).listen(3000);

*/

