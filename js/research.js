let socket = io.connect('http://127.0.0.1:4000');
let input_search = document.getElementById('search');
let btn_search = document.getElementById('btn_search');
let div_result_search = document.getElementById('result_search');

input_search.value = localStorage.getItem('recherche_value');


btn_search.addEventListener('click', ()=>{
    localStorage.setItem('recherche_value', input_search.value );
    socket.emit('search', input_search.value);
})

socket.on('result_search', (data)=>{
    console.log('resultat recu');
    div_result_search.innerHTML = '';
    for(let x = 0; x< data.length; x++){
        let message = document.createElement('div');
        message.setAttribute('class', 'msg_result_search');
        message.innerHTML = '<a href="' + data[x].url +'" class="a_source">' + data[x].texte + '</a>';
        div_result_search.appendChild(message);
        div_result_search.insertBefore(message, div_result_search.firstChild);
    }

    let a_source = document.getElementsByClassName('a_source');
    for(let i = 0; i < a_source.length; i++){
        a_source[i].addEventListener('click', function(){    
            chrome.tabs.create({"url":a_source[i].href,"selected":true});
        })
    }
})


