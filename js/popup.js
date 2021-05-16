
let id = chrome.runtime.id;
let current_url = chrome.tabs.getSelected(null,function(tab) {
    current_url = tab.url;
    return current_url;
});
   //let socket = io.connect('http://127.0.0.1:3000');
  let socket = io.connect('https://logicosh.fr');
 //let socket = io.connect('https://www.logicosh.be');

// INITIALISATION, ON EMIT NOS DONNES AU SERVEUR
socket.emit('init_popup', id);

let tab_input_status = document.getElementsByClassName('input_status');
let div_gr = document.getElementById('rep_groupe');

// Function unique

table_url = [];
function removeDuplicates(table_url) {
  let unique = {};
  table_url.forEach(function(i) {
    if(!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
}




// ON RECOIT LES DONNEES DU SERVEUR POUR l'INTITIALISATION
socket.on('rep_init_popup', (data)=>{
    console.log('ON rep_init_popup')
    console.log('--->', data)
    for(let x = 0; x < tab_input_status.length; x++){
        if(data.res[0].status === tab_input_status[x].dataset.status){
            tab_input_status[x].classList.add('status_selected');
        }
    }
    // ON TRAITE L'AFFICHAGE DES GROUPES A l'INITIATION

    for(let i = 0; i < data.res[0].groupes.length; i++){
        console.log('EN TRAVAIL')
        let v = data.res[0].groupes.length - i;
            // ON GERE L'AFFICHAGE DES GROUPES
        let ligne_gr = document.createElement('div');
        let grp_status = 'red';
        if(data.res[0].groupes[i].status == 1){grp_status = 'green green_gr'}
        console.log(data);

        let html_option_dossier = '<option class="option_dossier" value="'+ data.res[0].groupes[i].dossier +'">'+ data.res[0].groupes[i].dossier +'</option>';
        console.log('EN TEST--->', data.res[0].groupes[i].dossier);
        for(let k = 0; k<data.gr[i].dossier.length;k++){
            if(data.gr[i].dossier[k] != data.res[0].groupes[i].dossier){
            html_option_dossier = html_option_dossier + '<option class="option_dossier" value="'+data.gr[i].dossier[k] +'">'+data.gr[i].dossier[k] +'</option>';
        }}


        // On affiche le changement de dossier que sur le groupe actif car bug avec changement de dossier groupe pas actif
        let select_folder;

        grp_status === 'green green_gr' ? select_folder = '<select id="select_dossier">' +  html_option_dossier + '</select>' : select_folder = '';



        /*select_folder = '<select id="select_dossier">'
                            +  html_option_dossier +
                        '</select>'*/

                                                  /*  Pas oublier d'afficher la croix qui delete UNIQUEMENT si le l'id du groupe = a un groupe du user ? */
        ligne_gr.innerHTML =    '<div class="flex-row">\
                                    <div class="tr_gr tr_delete">\
                                        <img src="../img/cross.png" class="img_cross img_delete" data-name="'+ data.res[0].groupes[i].id +'"/>\
                                    </div>\
                                    <div class="flex-row span_see_info_gr">\
                                        <div class="tr_gr">'  + v + '</div>\
                                        <div class="tr_gr"> '+ data.gr[i].name +' </div> \
                                        <div class="tr_gr tr_description">'+ data.gr[i].description +' </div>\
                                    </div>\
                                    <div class="tr_gr tr_dossier">'
                                          +  select_folder +
                                    '</div>\
                                       \
                                    <div data-group="'+ data.res[0].groupes[i].id +'" class="div_status_grp tr_gr ' + grp_status + '"></div>\
                                </div>\
                                <div class="div_info_gr none"></div>';
        div_gr.appendChild(ligne_gr);
        div_gr.insertBefore(ligne_gr, div_gr.firstChild);

    }



    // CHANGEMENT DE DOSSIER

    // let option_dossier = document.getElementsByClassName('option_dossier');
    let select_dossier = document.getElementById('select_dossier');
        select_dossier.addEventListener('change', () => {
            socket.emit('change_dossier', {id:id, dossier:select_dossier.value});
           document.getElementById('rep_groupe').innerHTML = "";
           document.getElementById('result_my_activity').innerHTML = "";
           document.getElementById('result_search').innerHTML = "";
           socket.emit('init_popup', id);
            console.log('OPTION CLICKED', select_dossier.value)
        })
 



    let tab_span_see_info_gr = document.getElementsByClassName('span_see_info_gr');
    let div_info_gr = document.getElementsByClassName('div_info_gr');
    let y = 0;
    for(let x = div_info_gr.length - 1; x > -1 ;x--){
        tab_span_see_info_gr[x].addEventListener('click', () => {
            div_info_gr[x].classList.toggle('none');
        })
        let table_url = [];
        if(data.kosh_gr[x]){
        for(let i =0 ; i<data.kosh_gr[x].length; i++){
            div_info_gr[y].innerHTML = div_info_gr[y].innerHTML + '<div class="ligne_info_gr"><a class="a_source_gr gris-clair" href="'+data.kosh_gr[x][i].url+'">'+ data.kosh_gr[x][i].texte+'</a></div>';
            table_url.push(data.kosh_gr[x][i].url);
        }
        div_info_gr[y].innerHTML = div_info_gr[y].innerHTML + '<hr>';
       table_url = removeDuplicates(table_url);
        for(let i =0 ; i<table_url.length; i++){
            div_info_gr[y].innerHTML = div_info_gr[y].innerHTML + '<div class="ligne_info_gr"><a class="a_source_gr gris-clair" href="'+table_url[i]+'">'+ table_url[i]+'</a></div>';
        }
        y++; 
    }
}

let a_source = document.getElementsByClassName('a_source_gr');
for(let i = 0; i < a_source.length; i++){
    a_source[i].addEventListener('click', function(){   
         socket.emit('change_url_status',{user: id, url: a_source[i].href, on:1});
        chrome.tabs.create({"url":a_source[i].href,"selected":true});
    })
}
   

    let img_delete = document.getElementsByClassName('img_delete');
    for(let x = 0; x < img_delete.length; x++){
        img_delete[x].addEventListener('click', function(){
            console.log(img_delete[x].dataset.name);
            socket.emit('delete_gr',{id_gr : img_delete[x].dataset.name, id_client : id, url:window.location.href} );
        })
    }

    let div_status_grp = document.getElementsByClassName('div_status_grp');

    for(let x = 0; x < div_status_grp.length; x++){
        div_status_grp[x].addEventListener('click', function (){
            // désactiver groupes puis activer status groupe 1 pour eviter multi groupe activé ?
            socket.emit('changed_status_gr',{id:id,id_gr: div_status_grp[x].dataset.group});
            //socket.emit('init_back');
        })
    }

    let div_wait = document.getElementById('div_wait');
    div_wait.classList.add('none');
   

});

// ON GERE LE URL ON
    let div_url_on = document.getElementById('div_url_on');
    div_url_on.addEventListener('click',()=>{
        if(div_url_on.classList.contains('red')){
           // div_url_on.innerText = 'DESACTIVER SUR CE SITE';
        }
        else{
           // div_url_on.innerText = 'ACTIVER SUR CE SITE';
        }
            div_url_on.classList.toggle('red');
            div_url_on.classList.toggle('green');
        socket.emit('change_url_status',{user: id, url: current_url, on:0});
        chrome.tabs.reload(); 
    })
    
// AU BOULOT
//var someVar = {text: 'test', foo: 1, bar: false};
chrome.tabs.executeScript({
    code: '(' + function(params) {
        let url_on = document.getElementById('url_on');
        let on = 0;
        if(url_on){
             on = 1;
        }
        return on;
    
    } + ')(' + JSON.stringify() + ');'
}, function(results) {
    if(results == 1){
        div_url_on.classList.remove('green');
        div_url_on.classList.add('red');
       // div_url_on.innerText = 'ACTIVER SUR CE SITE';
    }
});









 // INIT MY ACTIVITY
 socket.on('init_activity', (data)=>{
    let div_result_activity = document.getElementById('result_my_activity');
    div_result_activity.innerHTML = '';
    for(let x = 0; x< data.length; x++){
        let message = document.createElement('div');
        message.setAttribute('class', 'msg_result_search');

        let text_split = data[x].texte.split('\n');
        let text_push = '';
        for(u = 0; u < text_split.length; u++){
            text_push = text_push + text_split[u] + '<br>';
        }

        text_push = text_push.split('. ');

      
       let texte_push = '';
        for(u = 0; u < text_push.length; u++){

            if(text_push[u] != '' && text_push[u] != ' ' ){
                if(u<texte_push.length -1){
            texte_push = texte_push + text_push[u] + '.' + '\n';
            }
            else{
                texte_push = texte_push + text_push[u]; 
            }
            }

        }
      
        message.innerHTML = '<div class="div_row_result_search"><div class="div_last_s" data-name="'+data[x].last_search+'"> '+data[x].last_search+'</div><div class="div_info_searched div_info_searched_activity"><a href="' + data[x].url +'" class="a_source koshed a_info_activity">' + texte_push + '</a></div><div class="div_CTA_activity flex-row"><img src="../img/sheet.png" class="icon_activity img_icon icon_activity_copy"/><img src="../img/cross.png" class="icon_activity img_icon icon_activity_delete"/></div></div>';
        div_result_activity.appendChild(message);
        div_result_activity.insertBefore(message, div_result_activity.firstChild);
    }

    let a_info_activity = document.getElementsByClassName('a_info_activity');
    let btn_copy_activity = document.getElementsByClassName('icon_activity_copy');
    let btn_delete_activity =  document.getElementsByClassName('icon_activity_delete');
    let div_ligne_activity = document.getElementsByClassName('div_row_result_search');
    for(let j = 0; j < btn_copy_activity.length; j++){

        btn_delete_activity[j].addEventListener( 'click', function(){
            console.log("EN TRAVAUX", '->USER = ',id, '->TEXTE =',a_info_activity[j].innerText, '->URL =',a_info_activity[j].href)
        socket.emit('remove_kosh',{id_user:id, texte:a_info_activity[j].innerText.toLowerCase().trim(),  url :a_info_activity[j].href});
            div_ligne_activity[j].style.display = "none";

    } );


        btn_copy_activity[j].addEventListener( 'click', function(){
        var toCopy  = a_info_activity[j],
        btnCopy = btn_copy_activity[j];
        let old_html_activity = toCopy.innerHTML;
            toCopy.innerHTML = '<textarea id="text_to_copy">' + toCopy.innerText +'</textarea>';
        let textarea_info = document.getElementById('text_to_copy');
        textarea_info.select();
    document.execCommand( 'copy' );
    toCopy.innerHTML = old_html_activity;

} );

}

    // FIN TEST

    let a_source = document.getElementsByClassName('a_source');
    for(let i = 0; i < a_source.length; i++){
        a_source[i].addEventListener('click', function(){  
            socket.emit('change_url_status',{user: id, url: a_source[i].href, on:1});  
            chrome.tabs.create({"url":a_source[i].href,"selected":true});   
        })
    }

    let div_last_s = document.getElementsByClassName('div_last_s');
 for(let x = 0; x < div_last_s.length; x++){
     div_last_s[x].addEventListener('click',function(){
        input_search.value = div_last_s[x].dataset.name;
        input_search.classList.add('b-yellow');
         socket.emit('search', div_last_s[x].dataset.name);
            location.hash = "";
            location.hash = "#result_search";
            
        
     })
 }

 });



// ON GERE LE CLICK SUR L'ICON "ADD GROUP" ET "JOIN GROUP"
    let icon_add = document.getElementById('icon_add_gr');
    let icon_join = document.getElementById('icon_join_gr');
    let icon_search = document.getElementById('icon_search_gr');
    let div_add_gr = document.getElementById('div_add_gr');
    let div_join_gr = document.getElementById('div_join_gr');
    let div_search_gr = document.getElementById('div_search_gr');
    let div_grps = document.getElementsByClassName('div_grps');
   
   let remove_div_grps = function(){
    for(let i = 0; i <div_grps.length; i++){
        div_grps[i].classList.add('none');
    }
   }
   
  

        icon_add.addEventListener('click', ()=>{
            remove_div_grps();
            div_add_gr.classList.remove('none');
        })
        icon_join.addEventListener('click', ()=>{
            remove_div_grps();
            div_join_gr.classList.remove('none');
        })

        icon_search.addEventListener('click', ()=>{
            remove_div_grps();
            div_search_gr.classList.remove('none');
        })


            socket.on('init_back', () => {
                div_gr.innerHTML = '';
                socket.emit('init_popup', id);
            });

            for(let p = 0; p < tab_input_status.length; p++){
                tab_input_status[p].addEventListener('click', ()=>{
                    let status_value = tab_input_status[p].dataset.status;
                    socket.emit('status_changed',{status_value, id} );
                })
            }

            socket.on('rep_status_changed',(data)=>{
                console.log('ON rep_status_changed')
                for(let p = 0; p < tab_input_status.length; p++){
                    tab_input_status[p].classList.remove('status_selected'); 
                    if(tab_input_status[p].dataset.status == data){
                        tab_input_status[p].classList.add('status_selected'); 
                    }
                }
            })

 let input_nom_gr = document.getElementById('input_nom_gr');
 let input_description_gr = document.getElementById('input_description_gr');
let btn_add_gr = document.getElementById('btn_add_gr');
let input_search = document.getElementById('search');
let btn_search = document.getElementById('btn_search');
let div_result_search = document.getElementById('result_search');
let span_public = document.getElementsByClassName('span_input_public');
let span_mono = document.getElementsByClassName('span_input_mono');


input_search.value = localStorage.getItem('recherche_value');

let value_span_1 = 1;
    span_public[0].addEventListener('click', ()=>{
         value_span_1 = 1;
         span_public[1].classList.remove('status_selected');
         span_public[0].classList.add('status_selected');
        })
    span_public[1].addEventListener('click', ()=>{
         value_span_1 = 0;
         span_public[0].classList.remove('status_selected');
         span_public[1].classList.add('status_selected');
        })

 let value_span_2 = 1;
    span_mono[0].addEventListener('click', ()=>{ 
        value_span_2 = 1;
        span_mono[1].classList.remove('status_selected');
        span_mono[0].classList.add('status_selected');
    
    })
    span_mono[1].addEventListener('click', ()=>{ 
        value_span_2 = 0;
        span_mono[0].classList.remove('status_selected');
        span_mono[1].classList.add('status_selected');
    })


btn_add_gr.addEventListener('click', ()=>{
    // Vérifier que les inputs ne sont pas vides avant de emit car sinon risque pb avec bdd après
    socket.emit('new_groupe', {name : input_nom_gr.value, description: input_description_gr.value, id:id, span_1 : value_span_1, span_2 : value_span_2})
    // Faudra peut etre vider la value des inputs avant display none, vérifier
    //input_nom_gr.value = '';
   //input_description_gr.value = '';
    //value_span_1 = ''; // OU 1?
    //value_span_2 = ''; // OU 1?
    //div_add_gr.style.display = 'none'
})


// ON ENVOIS LA SOCKET POUR REJOINDRE UN GROUPE
let btn_join_group = document.getElementById('btn_join_gr');
let input_join_group = document.getElementById('input_join_gr');

btn_join_group.addEventListener('click', () => {
    console.log('group join')
    // ATTENTION INPUT JOIN GROUP = string input et pas ID GROUP
  socket.emit('join_group',{id_group : input_join_group.value, id_client : id} ) ;
  input_join_group.value = '';
})

// ON GERE L'AJOUT DE DOSSIER

let input_new_dossier = document.getElementById('input_new_dossier');
let btn_new_dossier = document.getElementById('btn_new_dossier');
let id_gr_dossier = 0;
let nom_new_dossier = '';
btn_new_dossier.addEventListener('click', () => {
  nom_new_dossier = input_new_dossier.value;
  console.log(document.getElementsByClassName('green_gr'), 'idgrdossier')
  //return;
  id_gr_dossier = document.getElementsByClassName('green_gr')[0].dataset.group;

  socket.emit('add_new_dossier', {id_gr: id_gr_dossier, nom_dossier:  nom_new_dossier });

})


// ON GERE LE SYSTEME DE RECHERCHE DES GROUPES
let btn_search_gr = document.getElementById('btn_search_gr');
let input_search_gr = document.getElementById('search_gr')
let div_result_search_gr = document.getElementById('div_result_search_gr');

btn_search_gr.addEventListener('click', function(){
    socket.emit('get_gr_search',{search : input_search_gr.value, id_client : id} ) ;
})

socket.on('result_gr_search', (data)=>{
    console.log("retour result");
    div_result_search_gr.innerHTML = '';
    for(let x = 0; x< data.length; x++){
        let message = document.createElement('div');
        message.innerHTML = '<div class="div_row_result_search_gr flex-row"> <div class="div_title_gr"><p>name:'+data[x].name+'</p> <p>description:'+data[x].description+'</p></div><div data-id_gr="'+data[x]._id+'" class="div_btn_join_gr">Join</div> <div>';
        div_result_search_gr.appendChild(message);
        div_result_search_gr.insertBefore(message, div_result_search_gr.firstChild);
    }
    let btn_join_grp = document.getElementsByClassName('div_btn_join_gr');
    for(let x = 0; x < btn_join_grp.length; x++){
        btn_join_grp[x].addEventListener('click',()=>{
            socket.emit('join_group', {id_client: id, id_group:  btn_join_grp[x].dataset.id_gr })

        })
    }
});

// ON GERE LE SYSTEME DE RECHERCHE

// EMIT FOR MINE SEARCH 
let btn_search_mine = document.getElementById('btn_search_mine')
btn_search_mine.addEventListener('click', ()=>{
    localStorage.setItem('recherche_value', input_search.value.toLowerCase().trim());
    socket.emit('search_mine', {last_search:input_search.value.toLowerCase().trim(),id_client:chrome.runtime.id});
})

// EMIT SEARCH FOR ALL
btn_search.addEventListener('click', ()=>{
    localStorage.setItem('recherche_value', input_search.value.toLowerCase().trim() );
    socket.emit('search_all', input_search.value.toLowerCase().trim());
})
// EMIT SEARCH FOR GRP
let btn_search_grp = document.getElementById('btn_search_grp')
btn_search_grp.addEventListener('click', ()=>{
    localStorage.setItem('recherche_value', input_search.value.toLowerCase().trim());
    socket.emit('search_gr', {last_search:input_search.value.toLowerCase().trim(),id_client:chrome.runtime.id});
})

socket.on('result_search', (data)=>{
    console.log(data)
    div_result_search.innerHTML = '';
    for(let x = 0; x< data.length; x++){
        let message = document.createElement('div');
        message.setAttribute('class', 'msg_result_search');
        message.innerHTML = '<div class="div_row_result_search"><div class="div_info_searched"><a href="' + data[x].url +'" class="a_source koshed">' + data[x].texte + '</a></div><div class="div_CTA_info"><div class="flex-row"><img src="../img/see.png" class="img_cross img_voir_lien"/><p class="p_voir_lien"><a href="' + data[x].url +'" class="a_source">Voir lien</p></a></div><div>';
        div_result_search.appendChild(message);
        div_result_search.insertBefore(message, div_result_search.firstChild);
    }

    let a_source = document.getElementsByClassName('a_source');
    for(let i = 0; i < a_source.length; i++){
        a_source[i].addEventListener('click', function(){   
            socket.emit('change_url_status',{user: id, url: a_source[i].href, on:1}); 
            chrome.tabs.create({"url":a_source[i].href,"selected":true});
        })
    }
})



// ON GERE LE BUTON PDF TO HTML

let btn_convert = document.getElementById('btn_convert');
btn_convert.addEventListener('click', ()=>{
    
    var someVar = {text: 'test', foo: 1, bar: false};
    chrome.tabs.executeScript({
        code: '(' + function(params) {
            if(window.location.href.indexOf('.pdf') != -1){
            document.body.innerHTML = '<form method="post" class="none" id="form_convert" action="https://www.logiweb.be/PDF-HTML/process.php"> <input type="text" name="url" required="required" class="form-control" value="'+window.location.href+'"><input type="submit" class="btn_add_gr" id="btn_convert" value="Convertir votre fichier"></form>';
           document.body.innerHTML = document.body.innerHTML + '<h2 class="h2_pdf">Veuillez patienter quelques secondes, le temps à Kosh de rendre votre PDF editable..</h2>';
            let form = document.getElementById("form_convert")
            form.submit();
            return true
        }
        return false
        } + ')(' + JSON.stringify(someVar) + ');'
    }, function(results) {
        if(results == 'false'){
            alert('Rendez vous sur un fichier .PDF');
        }
    });

  //  console.log('lets go copy')
//socket.emit('copy_mine');
})


// ON GERE LE BUTON PDF TO HTML (CHARGER UN FICHIER)

let btn_convert_fichier = document.getElementById('btn_convert_fichier');
let input_files = document.getElementById('input_files');
btn_convert_fichier.addEventListener('click', ()=>{
    
    var someVar = {text: 'test', fichier:'ola'};
    chrome.tabs.executeScript({
        code: '(' + function(params) {
           // console.log(params);
            document.body.innerHTML = '<form action="https://www.logiweb.be/PDF-HTML/process.php" method="post" enctype="multipart/form-data"><input type="file" name="file" class="form-control-file" required="required"><input type="submit" class="btn btn-primary" value="Convertir votre fichier"></form>';

        }
         + ')(' + JSON.stringify(someVar) + ');'
    }, function(results) {
     //  console.log('well done')
    });

  //  console.log('lets go copy')
//socket.emit('copy_mine');
})


// ON GERE LE BUTON COPY

let btn_copy_all = document.getElementById('btn_copy_mine');
btn_copy_all.addEventListener('click', ()=>{
    
    var someVar = {text: 'test', foo: 1, bar: false};
    chrome.tabs.executeScript({
        code: '(' + function(params) {
            let url = window.location.href;
            let user = chrome.runtime.id;
            let datas = {url:url, user:user}
            socket.emit('copy_mine', datas);
            return datas;
        } + ')(' + JSON.stringify(someVar) + ');'
    }, function(results) {
        socket.emit('copy_mine', results[0]);
    });

  //  console.log('lets go copy')
//socket.emit('copy_mine');
})

socket.on('copy_mine',(data)=>{
    let string_to_copy = "";
    let div_result_copy = document.getElementById('div_rep_to_copy');
    if(data.length){
    for(let x = 0; x < data.length; x++){
        string_to_copy = string_to_copy + data[x].texte + ' \n\n\n';
        }
        div_result_copy.innerHTML = '<textarea id="textarea_rep_copy">'+ string_to_copy +'</textarea>';
       // console.log(string_to_copy);
    }
    else{
        div_result_copy.innerHTML = "Il n'y a rien de koshé sur la page que vous visitez";
    }
})

// ON GERE LE BUTON COPY GROUP

let btn_copy_gr = document.getElementById('btn_copy_gr');
btn_copy_gr.addEventListener('click', ()=>{
    
    var someVar = {text: 'test', foo: 1, bar: false};
    chrome.tabs.executeScript({
        code: '(' + function(params) {
            let url = window.location.href;
            let user = chrome.runtime.id;
            let datas = {url:url, user:user}
            socket.emit('copy_gr', datas);
            return datas;
        } + ')(' + JSON.stringify(someVar) + ');'
    }, function(results) {
        socket.emit('copy_gr', results[0]);
    });

})

socket.on('copy_gr',(data)=>{
    let string_to_copy = "";
    let div_result_copy = document.getElementById('div_rep_to_copy');
    if(data.length){
    for(let x = 0; x < data.length; x++){
        string_to_copy = string_to_copy + data[x].texte + ' \n\n\n';
    }
    div_result_copy.innerHTML = '<textarea id="textarea_rep_copy">'+ string_to_copy +'</textarea>';
   // console.log(string_to_copy);
    }
    else{
        div_result_copy.innerHTML = "Il n'y rien de koshée sur la page que vous visitez";
    }
})

