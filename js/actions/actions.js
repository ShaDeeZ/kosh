
module.exports = {

  initPopup: (socket, users, groupes, kosh, kosh_gr, mongoose) => {
    // INIT OF POPUP.HTML ---> data = id of client
    socket.on('init_popup', async (data) => {

      //try {
        const res = await users.find({user: data}).limit(1).toArray();

        if (res === undefined || !res.length || res.length === 0) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHANGE PLACE
          await users.insertOne({user: data, status: 1, groupes: [], url_rm: []});
          console.log('user added init pop');
        }
        let obj_gr_user = {};
        let tab_name_gr = [];
        let tab_kosh_gr = [];
        // HANDLE THE GROUPS OF USER


        //res[0].groupes undefined au demarrage car pas de user? passe pas dans la condition au dessus
        //let groupes;
        //res[0].groupes !== undefined ? groupes = res[0].groupes : groupes = [];

        if(res[0] !== undefined){
          console.log(res[0], 'res0')
          for (let x = 0; x < res[0].groupes.length; x++) {
            // SELECT GROUPS OF USER IN DATABASE
            console.log(res[0].groupes[x].id, 'OBJECTID')
            let idGroup = mongoose.Types.ObjectId(res[0].groupes[x].id);

            const rep = await groupes.find({_id: res[0].groupes[x].id}).limit(1).toArray();

            console.log(rep, 'REPPPP')

              obj_gr_user = {
                id: rep[0]._id,
                name: rep[0].name,
                description: rep[0].description,
                public: rep[0].public,
                contributor: rep[0].contributor,
                dossier: rep[0].dossier
              };
              tab_name_gr.push(obj_gr_user);


            //console.log('EN TRAVAIL --->', tab_name_gr)
            // SELECT TEXTS KOSHED FROM GROUPES
            if (res[0].groupes[x].dossier !== undefined) {
              console.log(res[0].groupes[x].dossier, 'dossier')
              //console.log('TRAVAIL0');


              if (res[0].groupes[x].dossier.toLowerCase() !== 'all') {

                const res_kosh_gr = await kosh_gr.find({$and: [{gr: res[0].groupes[x].id}, {dossier: res[0].groupes[x].dossier}]}).sort({_id: -1}).limit(10).toArray();
                tab_kosh_gr.push(res_kosh_gr);
                // EMIT TO CLIENT IN THE LAST ITERATION

                if (x == res[0].groupes.length - 1) {
                  // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                  socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                  console.log('TRAVAIL1');
                }

              } else {

                const res_kosh_gr = await kosh_gr.find({gr: res[0].groupes[x].id}).sort({_id: -1}).limit(10).toArray();
                tab_kosh_gr.push(res_kosh_gr);

                // EMIT TO CLIENT IN THE LAST ITERATION
                if (x == res[0].groupes.length - 1) {

                  // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                  socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                  console.log('TRAVAIL2');
                }

              }
            }

          }
        }
        // INIT MY ACTIVITY
        const activity = await kosh.find({user: data}).sort({_id: -1}).limit(10).toArray();
        socket.emit('init_activity', activity);
      /*}catch (e) {
        console.error(e)
      }*/

      /*console.log(data, 'data')
      // FIND USER WHO REQUESTED INFORMATIONS
      users.find({user: data}).limit(1).toArray(function (err, res) {

        if (res === undefined || !res.length || res.length === 0) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHANGE PLACE
          users.insertOne({user: data, status: 1, groupes: [], url_rm: []}, function () {
            console.log('user added init pop');
          })
        }
        let obj_gr_user = {};
        let tab_name_gr = [];
        let tab_kosh_gr = [];
        // HANDLE THE GROUPS OF USER


        //res[0].groupes undefined au demarrage car pas de user? passe pas dans la condition au dessus
        //let groupes;
        //res[0].groupes !== undefined ? groupes = res[0].groupes : groupes = [];

        if(res[0] !== undefined){
          console.log(res[0], 'res0')
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
              if (res[0].groupes[x].dossier !== undefined) {
                console.log(res[0].groupes[x].dossier, 'dossier')
                //console.log('TRAVAIL0');


                if (res[0].groupes[x].dossier.toLowerCase() !== 'all') {
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
        }


      })
      // INIT MY ACTIVITY
      kosh.find({user: data}).sort({_id: -1}).limit(10).toArray(function (err, res) {
        socket.emit('init_activity', res);
      })*/
    })
  },

  checkUrl: (socket, users) => {
    //CHECK IF URL IS DISABLE OF NOT
    socket.on('check_url', async (data) => {
      console.log('ON check_url')

      //try {
        const res = await users.find({user: data.id}).limit(1).toArray();

        let url_user;
        res[0] !== undefined ? url_user = res[0].url_rm : url_user = [];

        if (res === undefined || !res.length) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          await users.insertOne({user: data.id, status: 1, groupes: [], url_rm: []});
          console.log('user added check url');
        }
        let url_find = 0;
        for (let x = 0; x < url_user.length; x++) {
          if (data.url.indexOf(url_user[x]) !== -1) {
            url_find = 1;
            break;
          }
        }
        if (url_find === 0) {
          socket.emit('url_checked');
          //socket.emit('url_on');
          console.log('check_url EMIT url_checked')
        } else {
          socket.emit('url_on');
          console.log('check_url EMIT url_on')
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*users.find({user: data.id}).limit(1).toArray(function (err, res) {
        let url_user;
        res[0] !== undefined ? url_user = res[0].url_rm : url_user = [];
        // console.log("RESSSS----->", res);
        if (res === undefined || !res.length) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          users.insertOne({user: data.id, status: 1, groupes: [], url_rm: []}, function () {
            console.log('user added check url');
          })
        }
        let url_find = 0;
        for (let x = 0; x < url_user.length; x++) {
          if (data.url.indexOf(url_user[x]) !== -1) {
            url_find = 1;
            break;
          }
        }
        if (url_find === 0) {
          socket.emit('url_checked');
          //socket.emit('url_on');
          console.log('check_url EMIT url_checked')
        } else {
          socket.emit('url_on');
          console.log('check_url EMIT url_on')
        }
      })*/


    })
  },

  changeUrlStatus: (socket, users) => {
    // UPDATE L'URL LORSQU'ON REACTIVE KOSH SUR UNE NOUVELLE PAGE
    socket.on('change_url_status', async (data) => {
      console.log('ON change_url_status')

      //try {
        const res = await users.find({user: data.user}).limit(1).toArray();

        if (res.length > 0) {
          let new_url_on = [];
          let url_find = 0;
          for (let x = 0; x < res[0].url_rm.length; x++) {
            if (data.url.indexOf(res[0].url_rm[x]) === -1) {
              new_url_on.push(res[0].url_rm[x]);
            } else {
              url_find = 1;
            }
          }
          if (url_find === 0 || data.on === 1) {
            let url_to_split = data.url.split('//')[1];
            let new_url = url_to_split.split('/')[0];
            console.log(new_url_on, 'db-->url', new_url)
            new_url_on.push(new_url);
            console.log(new_url_on, 'change_url_status_ NEW URL')
          }


          await users.updateOne({'user': data.user}, {$set: {'url_rm': new_url_on}});
          console.log('change_url_status_USER_URL_UPDATED')
        }
      /*}catch (e) {
        console.error(e)
      }*/



      /*users.find({user: data.user}).limit(1).toArray(function (err, res) {
        if (res.length > 0) {
          let new_url_on = [];
          let url_find = 0;
          for (let x = 0; x < res[0].url_rm.length; x++) {
            if (data.url.indexOf(res[0].url_rm[x]) === -1) {
              new_url_on.push(res[0].url_rm[x]);
            } else {
              url_find = 1;
            }
          }
          if (url_find === 0 || data.on === 1) {
            let url_to_split = data.url.split('//')[1];
            let new_url = url_to_split.split('/')[0];
            console.log(new_url_on, 'db-->url', new_url)
            new_url_on.push(new_url);
            console.log(new_url_on, 'change_url_status_ NEW URL')
          }


          users.updateOne({'user': data.user}, {$set: {'url_rm': new_url_on}}, function () {
            console.log('change_url_status_USER_URL_UPDATED')
          })
        }
      })*/


    });
  },

  statusChanged: (socket, users) => {
    // UPTDATE USER STATUS
    socket.on('status_changed', async (data) => {
      console.log('ON status_changed')

      //try {
        const res = await users.find({user: data.id}).limit(1).toArray();

        if (res.length) {
          //UPDATE STATUS IN USER TABLE //
          await users.updateOne({user: data.id}, {$set: {'status': data.status_value}});
          console.log('user updated status changed');
          socket.emit('rep_status_changed', data.status_value);
        } else {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          await users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []});
          console.log('user added status_changed');
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*// SELECT USER FROM DATABASE
      users.find({user: data.id}).limit(1).toArray(function (err, res) {
        if (res.length) {
          //UPDATE STATUS IN USER TABLE //
          users.updateOne({'user': data.id}, {$set: {'status': data.status_value}})
          console.log('user updated status changed');
          socket.emit('rep_status_changed', data.status_value);
        } else {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []}, function () {
            console.log('user added status_changed');
          })
        }
      })*/
    })
  },

  likeKoshGr: (socket, kosh_gr, mongoose) => {
    // ADD LIKE ON TEXT IN KOSH GROUPE
    socket.on('like_kosh_gr', async (data) => {
      //try {
        let pt = data.point + 1;
        let id_grp = mongoose.Types.ObjectId(data.gr);

        await kosh_gr.updateOne(
          {$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]},
          {$set: {point: pt}}
        );
      /*}catch (e) {

      }*/

    })
  },

  removeKoshGr: (socket, kosh_gr, mongoose) => {
    // REMOVE LIKE ON TEXT IN KOSH GROUPE
    socket.on('remove_kosh_gr', async (data) => {

      //try {
        let id_grp = mongoose.Types.ObjectId(data.gr);
        const res = await kosh_gr.find({$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]}).toArray();

        if (res.length) {
          console.log('OLA', res[0].point)
          let nbr_like = res[0].point - 1;
          if (nbr_like < 1) {
            console.log('HALO', res[0].point)
            await kosh_gr.deleteOne({_id: res[0]._id});
          } else {
            await kosh_gr.updateOne(
              {_id: res[0]._id},
              {$set: {point: nbr_like}}
            );
          }
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*let id_grp = mongoose.Types.ObjectId(data.gr);
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
      })*/

    })
  },

  removeKosh: (socket, kosh, kosh_gr) => {
    // DELETE MY KOSH
    socket.on('remove_kosh', async (data) => {
      //try {
        // kosh.deleteOne( {$and:[ {url:data.url},{texte:data.texte},{user:data.id_user} ]} );
        await kosh.deleteMany({url: data.url, texte: data.texte, user: data.id_user});
        await kosh_gr.deleteMany({url: data.url, texte: data.texte, user: data.id_user});

      /*}catch (e) {
        console.error(e)
      }*/
    })
  },

  copyMine: (socket, kosh) => {
    // COPY // COPY YOUR KOSH??
    socket.on('copy_mine', async (data) => {
      //try {
        console.log(data)
        if (data !== undefined && data !== null) {
          const res = await kosh.find({$and: [{url: data.url}, {user: data.user}]}).limit(100).sort({_id: 1}).toArray();
          socket.emit('copy_mine', res);
        }
      /*}catch (e) {
        console.error(e)
      }*/

    })
  },

  copyGr: (socket, users, kosh_gr) => {
    // COPY GROUP'S KOSH??
    socket.on('copy_gr', async (data) => {

      //try {
        if (data !== undefined && data !== null) {
          const res = await users.find({user: data.user}).limit(100).sort({_id: 1}).toArray();

          if (res) {
            console.log(res)
            for (let y = 0; y < res[0].groupes.length; y++) {
              if (res[0].groupes[y].status === 1) {
                const resCopy = await kosh_gr.find({$and: [{url: data.url}, {gr: res[0].groupes[y].id}]}).sort({_id: -1}).toArray();
                socket.emit('copy_gr', resCopy);
              }
            }
          }
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*if (data !== undefined && data !== null) {
        console.log(data.user)
        //let id_user_1 = mongoose.Types.ObjectId(data.user.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        users.find({user: data.user}).limit(100).sort({_id: 1}).toArray(function (err, res) {
          if (res) {
            console.log(res)
            for (let y = 0; y < res[0].groupes.length; y++) {
              if (res[0].groupes[y].status === 1) {
                kosh_gr.find({$and: [{url: data.url}, {gr: res[0].groupes[y].id}]}).sort({_id: -1}).toArray(function (err, res) {
                  socket.emit('copy_gr', res);
                })
              }
            }
          }
        })
      }*/
    })
  },

  input: (socket, client, kosh, users, kosh_gr, mongoose) => {
    // WHEN USER UNDERLINE SOMETHING --> QUAND QUELQU'UN KOSH QQCH
    socket.on('input', async (data) => {
      //try {
        console.log('ON input');

        const { url, texte, div, user, last_search, page } = data;

        // Insert message
        // ON SUPPRIME LES DOUBLONS
        await kosh.deleteMany({url: url, user: user, texte: texte});

        const res = await kosh.insertOne({
          url: url,
          texte: texte,
          div: div,
          user: user,
          last_search: last_search,
          page: page
        });

        socket.emit('output', res.ops);

        const user_gr = await users.find({user: user}).limit(1).sort({_id: 1}).toArray();
        console.log(user_gr, 'INPUT USER GRRRRRR')

        for (let y = 0; y < user_gr.length; y++) {
          if (user_gr[y].status == 1) {
            console.log('etape 1');
            // ON SUPPRIME LES DOUBLONS DES GROUPES
            await kosh_gr.deleteMany({url: url, user: user, texte: texte});

            // ICI ERREUR ? COMMENT CA POUVAIT FONCTIONNER ? GR ET DOSSIER MAUVAISE VARIABLE PASSEE

            await kosh_gr.insertOne({
              url: url,
              texte: texte,
              div: div,
              gr: user_gr[0].groupes[y].id,
              last_search: last_search,
              user: user,
              point: 1,
              page: page,
              dossier: user_gr[0].groupes[y].dossier
            });
            socket.join('groupe1');
            client.to('groupe1').emit('test_room', {test: 'ca marche pour la room'});

            //socket.emit('output_gr', res.ops);
            // socket.broadcast.emit('output_gr', res.ops);
          }
        }


      /*}catch (e) {
        console.error(e)
      }*/



     /* // variables recues par les sockets
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
      })*/


    });
  },

  connected: (socket, kosh) => {
    // NEW CONNECTION FROM CLIENT
    socket.on('connected', async (data) => {

      // Get texte underlined from mongo collection
      //try {
        const res = await kosh.find({$and: [{url: data.url}]}).limit(50).sort({_id: 1}).toArray();

        // Emit the messages
        socket.emit('output', res);
      /*}catch (e) {
        console.error(e)
      }*/


      /*kosh.find({$and: [{url: data.url}]}).limit(50).sort({_id: 1}).toArray(function (err, res) {

        if (err) {

          throw err;
        }

        // Emit the messages

        socket.emit('output', res);
      });*/

    })
  },

  getGroupes: (socket, users) => {
    // EMIT LES GROUPES DU USER POUR l'URL DE LA PAGE
    socket.on('get_groupes', async (data) => {
      //try {
        const res = await users.find({user: data.id}).limit(1).toArray();
        socket.emit('rep_groupes', res);
      /*}catch (e) {
        console.error(e)
      }*/
    })
  },

  room: (socket, client, kosh_gr, mongoose) => {
    // JOIN TOUTES LES ROOMS DU USER
    socket.on('room', async (data) => {
      //try {
        socket.join(data.room);
        let id_room = mongoose.Types.ObjectId(data.room);

        const res = await kosh_gr.find({$and: [{gr: id_room}, {url: data.url}, {dossier: data.dossier}]}).limit(50).toArray();
        client.in(data.room).emit('msg_grp', res);
      /*}catch (e) {
        console.error(e)
      }*/

      /*socket.join(data.room);
      let id_room = mongoose.Types.ObjectId(data.room);
      kosh_gr.find({$and: [{gr: id_room}, {url: data.url}, {dossier: data.dossier}]}).limit(50).toArray(function (err, res) {
        client.in(data.room).emit('msg_grp', res);
      })*/
    });
  },


};