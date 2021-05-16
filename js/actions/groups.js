

module.exports = {

  newGroup: (socket, groupes, users) => {
    socket.on('new_groupe', async (data) => {
      // CREATE NEW GROUP
      // INSERT INTO GROUPS DATABASE
      // Vérifier que le groupe n'existe pas dans la bdd avant d'insert (2eme securité)? Car si un utilisateur différent créée un groupe avec le meme nom,
      // peut etre dire "Un groupe avec le meme nom existe deja, rejoignez ce groupe" ?? ou plusieurs groupe avec meme noms peuvent coexister ??

      //try{
        const insertGroup = await groupes.insertOne({
          name: data.name,
          description: data.description,
          lien: [],
          public: data.span_1,
          contributor: data.span_2,
          id_user: data.id,
          dossier: ['All', 'General']
        });

        if(insertGroup){
          // UPDATE THE GROUPS OF THE CONCERN USER /// ICI QUE LE ALL MINUSCULE SE MET??? user update dossier: [All, General]??? Changement all en All// JAI CHANGE STATUS: 0
          await users.updateOne({'user': data.id}, {$push: {groupes: {id: insertGroup.ops[0]._id, status: 0, dossier: "All"}}})
          console.log('user updated new_groupe')
          // SEND A INIT BACK FOR THE POPUP
          await socket.emit('init_back');
          console.log('emit init_back new group')
        }
      /*}catch (e) {
        console.error(e)
      }*/

       /*groupes.insertOne({
        name: data.name,
        description: data.description,
        lien: [],
        public: data.span_1,
        contributor: data.span_2,
        id_user: data.id,
        dossier: ['All', 'General']
      }, function (err, res) {
        console.log('groupe added');
        // UPDATE THE GROUPS OF THE CONCERN USER /// ICI QUE LE ALL MINUSCULE SE MET??? user update dossier: [All, General]??? Changement all en All
        users.updateOne({'user': data.id}, {$push: {groupes: {id: res.ops[0]._id, status: 1, dossier: "All"}}}, function () {
          console.log('user updated new_groupe')
        })
        // SEND A INIT BACK FOR THE POPUP
        socket.emit('init_back');
        console.log('init_back new groupe')
      })*/

    })
  },

  joinGroup: (socket, users, groupes, mongoose) => {
    // JOIN A GROUPE
    socket.on('join_group', async (data) => {
      console.log('ON join_group')
      //try {
        let id_grp = mongoose.Types.ObjectId(data.id_group);
        const res = await users.find({user: data.id_client}).limit(1).toArray();

        let tab_gr = res[0].groupes;
        let gr_found = 0;


        for (let x = 0; x < res[0].groupes.length; x++) {

          if (res[0].groupes[x].id == data.id_group) {
            gr_found = 1;
            console.log('GR FOUND 1')
            break;
          }
        }

        if (gr_found === 0) {

          await users.updateOne({'user': data.id_client}, {$push: {groupes: {id: id_grp, status: 0, dossier: "All"}}});

          console.log('user updated join_group')
          socket.emit('init_back');
        } else {
          console.log('deja dans le groupe');
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*console.log('ON join_group')
      let id_grp = mongoose.Types.ObjectId(data.id_group);
      users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
        let tab_gr = res[0].groupes;
        let gr_found = 0;
        for (let x = 0; x < res[0].groupes.length; x++) {
          if (res[0].groupes[x].id === data.id_group) {
            gr_found = 1;
            break;
          }
        }
        if (gr_found === 0) {
          users.updateOne({'user': data.id_client}, {$push: {groupes: {id: id_grp, status: 1, dossier: "All"}}}, function () {
            console.log('user updated join_group')
          })
          socket.emit('init_back');
        } else {
          console.log('deja dans le groupe');
        }
      })*/

    })
  },

  searchGroups: (socket, groupes) => {
    // SEARCH GROUPES
    socket.on('get_gr_search', async (data) => {

      //try{
        let replace = data.search;
        let re = new RegExp(replace, "gi");

        const res = await groupes.find({name: re}).limit(100).sort({_id: 1}).toArray();

        socket.emit('result_gr_search', res);

      /*}catch (e) {
        console.error(e)
      }*/

      /*groupes.find({name: re}).limit(100).sort({_id: 1}).toArray(function (err, res) {
        socket.emit('result_gr_search', res);
      });*/
    })
  },

  changeStatusGroup: (socket, users) => {
    // CHANGE STATUS OF GROUPE
    socket.on('changed_status_gr', async (data) => {

      //try {
        // DOSSIER all en minuscule??
        console.log(data, 'changeDATA')
        const res = await users.find({user: data.id}).limit(1).toArray();

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
            obj_gr = {id: res[0].groupes[x].id, status: status_final, dossier: "All"};

          } else {
            obj_gr = {id: res[0].groupes[x].id, status: 0, dossier: "All"};
          }

          tab_gr_final.push(obj_gr);
        }


        const updateUser = await users.updateOne({'user': data.id}, {$set: {groupes: tab_gr_final}});
        console.log( updateUser,'updateUser change status group')

        socket.emit('init_back');
        console.log('user updated changed_status_gr + emit init_back')

      /*}catch (e) {
        console.error(e)
      }*/


      /*console.log(data, "changeSTATUSDATA")
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
            obj_gr = {id: res[0].groupes[x].id, status: status_final, dossier: "All"};
          } else {
            obj_gr = {id: res[0].groupes[x].id, status: 0, dossier: "All"};
          }

          tab_gr_final.push(obj_gr);
        }
        users.updateOne({'user': data.id}, {$set: {groupes: tab_gr_final}}, function (err, res) {
          socket.emit('init_back');
          console.log('user updated changed_status_gr + emit init_back')
        });
      })*/

    })
  },

  deleteGroup: (socket, users) => {
    // DELETE GROUPE IN USER
    // DELETE GROUP TABLE???
    socket.on('delete_gr', async (data) => {

      //try {


        const res = await users.find({user: data.id_client}).limit(1).toArray();

        let tab_gr_final = [];

        for (let x = 0; x < res[0].groupes.length; x++) {
          if (res[0].groupes[x].id != data.id_gr) {
            console.log(res[0].groupes[x].id, data.id_gr, 'IFFFFFFF')
            let obj_gr = {id: res[0].groupes[x].id, status: res[0].groupes[x].status, dossier: "All"};
            tab_gr_final.push(obj_gr);

          }
        }
        console.log(tab_gr_final, 'TABGRFINAL')
        await users.updateOne({'user': data.id_client}, {$set: {groupes: tab_gr_final}})

        socket.emit('init_back');
        console.log('user updated delete_gr + emit init_back')
      /*}catch (e) {
        console.error(e)
      }*/

      /*users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
        let tab_gr_final = [];

        for (let x = 0; x < res[0].groupes.length; x++) {
          if (res[0].groupes[x].id != data.id_gr) {
            let obj_gr = {id: res[0].groupes[x].id, status: res[0].groupes[x].status, dossier: "All"};
            tab_gr_final.push(obj_gr);
          }
        }

        users.updateOne({'user': data.id_client}, {$set: {groupes: tab_gr_final}}, function (err, res) {
          socket.emit('init_back');
          console.log('user updated delete_gr + emit init_back')
        });


      })*/


    });
  },

};
