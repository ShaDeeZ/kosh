// CONNEXION SOCKET
let userId = chrome.runtime.id; // ID OF USER = ID GENERATE BY CHROME EXTENSION
//let socket = io.connect('http://127.0.0.1:3000');
//let socket = io.connect('https://www.logicosh.be');
let socket = io.connect('https://logicosh.fr');

let value_scroll = 0;

if(socket !== undefined){
    // SEND STATUS AND USER VALUE TO SERVER
    socket.emit('status_changed',{status_value:1, id:userId} )
    // SEND USER_ID AND CURRENT URL THATS GOING TO BE KOSHED
    socket.emit('check_url',{url : window.location.href, id : userId });
    console.log('statuschanged_checkurl')

    socket.on('url_checked',()=>{
        console.log('ON url_checked')
        // Obtenir une référence au premier enfant
        var theFirstChild = document.body.firstChild;
        // Créer un nouvel élément
        var newElement = document.createElement("span");
            //newElement.innerText = "url_on";
            newElement.id = "url_on";
        // Insérer le nouvel élément avant le premier enfant
        document.body.insertBefore(newElement, theFirstChild);
    })

    socket.on('url_on',()=>{
    // CODE EXECUTER LORSQUE LE USER SE CONNECTECT
    console.log('Connected to socket');

    // ON EMIT NOTRE URL ET NOTRE ID AU SERVEUR
        socket.emit('connected', {url : window.location.href })
        socket.emit('get_groupes', {id : userId })


        // ON GERE LA REPONSE DU SERVEUR CONCERNANT LES GROUPES DE NOTRE COMPTE ET ON LUI RENVOIS LA REP POUR SE CONNECTER AUX ROOMS DE NOS GROUPES
        socket.on('rep_groupes', (data)=>{
            for(let n = 0; n< data[0].groupes.length; n++){
                console.log(data[0].groupes[n].id);
                if(data[0].groupes[n].status == 1){
                socket.emit('room', {room : data[0].groupes[n].id, url : window.location.href,dossier:data[0].groupes[n].dossier});
                }
                
            }
        })

        // ON TRAITE LES MESSAGES A SURLIGNER PAR NOS GROUPES
        socket.on('msg_grp',(data)=>{
            let tab_data = '';
            let tab_page = '';
            for(let x = 0; x<data.length;x++){
                tab_data = tab_data + data[x].texte + '*';
                tab_page = tab_page + data[x].page + '*';
                if(window.find(data[x].texte)){
                    window.find(data[x].texte).selectedText;
                }

                else if( window.find(data[x].texte, false, true)){
                    window.find(data[x].texte, false, true).selectedText;
                }
                else{

                    let texte_intact = data[x].texte;
                    let texte_split = data[x].texte;

                      // SOL 2 --> REMOVE PAR MOT 
                    let tab_mots_find = texte_split.split('\n');
                    console.log(tab_mots_find);
                    for(let a = 0; a<tab_mots_find.length; a++){
                        if(tab_mots_find[a] != ' '){
                        if(window.find(tab_mots_find[a]) ){
                            window.find(tab_mots_find[a]).selectedText;
                            document.body.contentEditable = true;
                            document.execCommand ('hiliteColor', false, '#61FE95');
                            document.body.contentEditable = false;
                            
                            }

                        else if(window.find(tab_mots_find[a], false, true)){
                            window.find(tab_mots_find[a], false, true).selectedText;
                            document.body.contentEditable = true;
                            document.execCommand ('hiliteColor', false, '#61FE95');
                            document.body.contentEditable = false;
                            
                        }
                        else{
                           
                            console.log('SOL 2 FINI')
                        }

                            
                            }
                        }  
                  
                }
                document.body.contentEditable = true;
                document.execCommand ('hiliteColor', false, '#61FE95');
                document.body.contentEditable = false;

               if(x == data.length - 1){
               window.getSelection().empty()
                }}


                console.log('tab_dat---->',tab_data)
                tab_data = tab_data.split('*');
                tab_page = tab_page.split('*');
                // ON GERE LES LONG FICHIERS AVEC LE SCROLL
                let nbr_de_page = document.getElementsByClassName('pf')
                console.log(nbr_de_page)


                // QUE SI ON EST SUR UN PDF
                if(document.getElementById('page-container')){
                   // SOL 2

                   for(let w=0; w<nbr_de_page.length;w++){
                       nbr_de_page[w].addEventListener('mouseenter',(e)=>{

                            // TESTTTT !!!
                          let nbr_de_lignes = nbr_de_page[w].getElementsByClassName('t');
                            for(let t = 0; t<nbr_de_lignes.length; t++){
                                nbr_de_lignes[t].innerHTML = nbr_de_lignes[t].innerHTML + '<br>';
                            }





                     
                        for(let a = 0; a<tab_data.length; a++){
                            console.log(a,'--->','data-->',tab_data[a],'-->',tab_page[a])
                           // if(tab_page[a] == nbr_de_page[w].dataset.pageNo){

                        if(window.find(tab_data[a]) ){
                            tab_data.splice(a,1);
                            window.find(tab_data[a]).selectedText;
                            document.body.contentEditable = true;
                            document.execCommand ('hiliteColor', false, '#61FE95');
                            document.body.contentEditable = false;
                            
                            }

                        else if(window.find(tab_data[a], false, true)){
                            tab_data.splice(a,1);
                            window.find(tab_data[a], false, true).selectedText;
                            document.body.contentEditable = true;
                            document.execCommand ('hiliteColor', false, '#61FE95');
                            document.body.contentEditable = false;
                            
                        }
                        else{
                            let texte_intact = tab_data[a];
                            let texte_split = tab_data[a];
        
                              // SOL 2 --> REMOVE PAR MOT 
                            let tab_mots_find = texte_split.split('\n');
                            console.log(tab_mots_find);
                            for(let z = 0; z<tab_mots_find.length; z++){
                                if(tab_mots_find[z] != ' '){
                                if(window.find(tab_mots_find[z]) ){
                                    window.find(tab_mots_find[z]).selectedText;
                                    document.body.contentEditable = true;
                                    document.execCommand ('hiliteColor', false, '#61FE95');
                                    document.body.contentEditable = false;
                                    tab_data.splice(a,1);
                                    }
        
                                else if(window.find(tab_mots_find[z], false, true)){
                                    window.find(tab_mots_find[z], false, true).selectedText;
                                    document.body.contentEditable = true;
                                    document.execCommand ('hiliteColor', false, '#61FE95');
                                    document.body.contentEditable = false;
                                    tab_data.splice(a,1);
                                }
                                else{
                                   
                                    console.log('SOL 2 FINI')
                                }
                                
                                    
                                    }
                                }  
                     
                        }
                   
                }
                       })
                  
                   }
                    


            }

            let tab_span = document.getElementsByTagName('span');
            for(let q = 0; q < tab_span.length; q++){
                if(tab_span[q].style.backgroundColor == "rgb(97, 254, 149)"){
                    tab_span[q].classList.add('koshed_gr');
                    tab_span[q].title = 'Use Ctrl + Click to remove highlight';
                    tab_span[q].style.cursor = "pointer";
                        tab_span[q].addEventListener('click',(e)=>{
                            // console.log(e)
                            let text_to_remove = tab_span[q].innerText.toLowerCase().trim();
                            if(e.ctrlKey) {
                                socket.emit('remove_kosh_gr',{id_user:userId, texte:text_to_remove,  url : window.location.href, gr:data[x].gr, point:data[x].point });
                                tab_span[q].style.backgroundColor="rgba(0,0,0,0)";
                                tab_span[q].classList.remove('koshed_gr');
                                }
                                else{
                                    socket.emit('like_kosh_gr', {id_user:userId, texte:text_to_remove,  url : window.location.href, gr:data[x].gr, point:data[x].point });
                                    tab_span[q].style.border = "1px solid green";
                                    tab_span[q].style.fontWeight = "600";
                                  
                                }


                        })
                    }
                 }
                })
            
       
    
    // ON GERE CE QU'IL SE PASSE QUAND ON SURLIGNE QQCH
    socket.on('output', function(data){

       // console.log(data);
        
        if(data.length){
            if(data[0].url == window.location.href ){
            
            // SOL 3 -------> ENTRAIN DE TRAVAILLER 
          
            for(let x = 0; x<data.length;x++){
                document.getElementsByTagName('div')[0].focus();
                if(window.find(data[x].texte)){
                    window.find(data[x].texte).selectedText;
                }

                else if( window.find(data[x].texte, false, true)){
                    window.find(data[x].texte, false, true).selectedText;
                }
               

                document.body.contentEditable = true;
                if(data[x].user == userId){
                document.execCommand ('hiliteColor', false, 'yellow');
                }
                else{
                    document.execCommand ('hiliteColor', false, '#DC00FF');
                }
                document.body.contentEditable = false;
            }
               
            let tab_span = document.getElementsByTagName('span');
            for(let i = 0; i < tab_span.length; i++){
                if(tab_span[i].style.backgroundColor == "yellow"){
                    tab_span[i].classList.add('koshed');
                    tab_span[i].title = 'Use Ctrl + Click to remove highlight';
                    tab_span[i].addEventListener('click', function(e){
                      
                        if(e.ctrlKey) {
                         
                        let text_to_remove = tab_span[i].innerText.toLowerCase().trim();
                        socket.emit('remove_kosh',{id_user:userId, texte:text_to_remove,  url : window.location.href});
                        tab_span[i].style.backgroundColor="rgba(0,0,0,0)";
                        tab_span[i].classList.remove('koshed');
                        let tab_span_2 = tab_span[i].getElementsByTagName('span');
                        for(let x = 0; x < tab_span_2.length; x++){
                            tab_span_2[x].style.backgroundColor="rgba(0,0,0,0)";
                            tab_span_2[x].classList.remove('koshed');

                             }
                        }
                    })
                }
            }
            
            window.scrollTo(0,0);      
        }
        }
    });
    
    
    
    
    
  
    // ON EMIT LES INFORMATIONS QUE L'ON A SURLGINE --> LE CLICK DU SURLIGNEMENT
    document.body.addEventListener('mouseup', function(event){

        let texte = window.getSelection().toString().toLowerCase().trim();
        if( texte.length>3 && texte.length<400 && event.target.tagName.toLowerCase() != "input" && event.target.tagName.toLowerCase() != "svg" && event.target.tagName.toLowerCase() != "textarea" && event.target.tagName.toLowerCase() != "img" && event.target.id.toLowerCase() != "search"  && event.target.tagName.toLowerCase() != "path"){
            
        let url = event.target.baseURI;
      //  console.log(url);
        let div = event.path[0].tagName;
       // console.log(div);
        let user = chrome.runtime.id;
        let last_search = window.name.trim().toLowerCase();
        let page = 0;
        if(window.location.href.indexOf('logiweb.be/PDF-HTML/') != -1){
             page = event.target.closest(".pf").dataset.pageNo; 
            console.log('page->',page)
            
        }
       
        
     
            // Emit to the server input
            socket.emit('input', {
                url : url,
                texte : texte,
                div : div,
                user : user,
                last_search : last_search,
                page:page
conv
            });              
        }
    }) 
})      
}


// RECUPERER DERNIERE RECHERCHE GOOGLE

if(document.getElementsByName('q')[0] != undefined && window.location.href.indexOf('google.') != -1 ){
    console.log( window.location.href)
    document.body.addEventListener('click', ()=>{
        console.log( window.location.href)
       let google_search_bar = document.getElementsByName('q');
        // console.log(google_search_bar[0].value)
       // localStorage.setItem('last_search', google_search_bar[0].value );
        window.name =  google_search_bar[0].value;
        console.log(window.name)
    })
}


// RECUPERER LE TITRE DE LA DERNIERE BALISE CLIQUEE

if(window.location.href.indexOf('google.') == -1){
let tab_all_a = document.getElementsByTagName('a');
    for(let x = 0; x < tab_all_a.length; x++){
        tab_all_a[x].addEventListener('click', ()=>{
            let value_last_a_clicked = tab_all_a[x].innerText;
             window.name =  value_last_a_clicked;
         })
    }
}
   




if(localStorage.getItem('last_search') !== undefined){
   // let session_data = localStorage.getItem('last_search');
    console.log(window.name);
}


