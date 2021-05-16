
module.exports = {

  searchAll: (socket, kosh) => {
    // SEARCH FROM ALL USERS
    socket.on('search_all', async (data) => {
      //try {
        console.log(data, 'SEARCH_ALL');
        const res = kosh.find({last_search: data}).limit(100).sort({_id: 1}).toArray();
        socket.emit('result_search', res);
      /*}catch (e) {
        console.error(e)
      }*/
    })
  },

  searchMine: (socket, kosh) => {
    // YOUR KOSH
    socket.on('search_mine', async (data) => {
      //try {
        console.log(data, 'SEARCH_MINE');
        const res = await kosh.find({$and: [{last_search: data.last_search}, {user: data.id_client}]}).limit(100).sort({_id: 1}).toArray();

        socket.emit('result_search', res);
      /*}catch (e) {
        console.error(e)
      }*/

      /*kosh.find({$and: [{last_search: data.last_search}, {user: data.id_client}]}).limit(100).sort({_id: 1}).toArray(function (err, res) {
        socket.emit('result_search', res);
      })*/
    })
  },

  searchKoshGroups: (socket, users, kosh_gr, mongoose) => {
    // SEARCH KOSH FROM GROUPES
    socket.on('search_gr', async (data) => {
      console.log(data, 'SEARCH_GR');
      //try {
        const res = await users.find({user: data.id_client}).limit(1).toArray();

        for (let x = 0; x < res[0].groupes.length; x++) {
          if (res[0].groupes[x].status === 1) {
            let id_grpe = mongoose.Types.ObjectId(res[0].groupes[x].id);
            const resSearch = await kosh_gr.find({$and: [{last_search: data.last_search}, {gr: id_grpe}]}).sort({_id: -1}).toArray();

            socket.emit('result_search', resSearch);
          }
        }
      /*}catch (e) {
        console.error(e)
      }*/

      /*users.find({user: data.id_client}).limit(1).toArray(function (err, res) {
        // console.log(res)
        for (let x = 0; x < res[0].groupes.length; x++) {
          if (res[0].groupes[x].status === 1) {
            let id_grpe = mongoose.Types.ObjectId(res[0].groupes[x].id);
            kosh_gr.find({$and: [{last_search: data.last_search}, {gr: id_grpe}]}).sort({_id: -1}).toArray(function (err, res) {
              socket.emit('result_search', res);
            })
          }
        }
      })*/
    })
  },

};