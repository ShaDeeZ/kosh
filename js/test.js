function createHighlight(selection, nbrOfPreviousOccurence, href) {
    var selectionInBinary = "";
    try {
        //selectionInBinary = btoa(selection);
        selectionInBinary = btoa(unescape(encodeURIComponent(selection)));
    } catch (err) {
        console.log(err.message);
    }
    return {
        selection: selectionInBinary,
        nbrOfPreviousOccurence: nbrOfPreviousOccurence,
        url: href,
        user: null,
        groupSettings: null,
        category: null,
        threshold: null,
    };
}





function _addHighlight(url, highlight) {
    $.post(url.replace('http:', window.location.protocol) + "/comment/new", highlight, function (data, status) {
        console.log("Add highlight, data: " + data);
        //data id added in the database
        var elts = document.querySelectorAll("[data-id='-2']");
        for (var i = 0; i < elts.length; ++i) {
            elts[i].setAttribute("data-id", data);
        }
    });
}

function _getHighlight(url, highlight) {
    $.post(url.replace('http:', window.location.protocol) + "/comments", highlight, function (data, status) {
        console.log('_getHighlight' + data + ",Status: " + status);
        chrome.storage.sync.get({
            groupSettings: null,
            category: defaultCategory,
            categoryColor: defaultSurferColor,
        }, function (items) {
            var groupSettings = getGroupSettingsFromItem(items.groupSettings, items.category, items.categoryColor);
            highlightFromJsonData(JSON.parse(data), groupSettings);
        });
    });
}




// FICHIER 2 


/**
 * Scroll
 * @returns {ToolFind}
 */
var ToolFind = function () {
    this.position = [0, 0];
};

ToolFind.prototype.remenberPosition = function () {
    this.position = [window.pageXOffset, window.pageYOffset];
};

ToolFind.prototype.scrollToPosition = function () {
    window.scroll(this.position[0], this.position[1]);
};

ToolFind.prototype.findAndHighlight = function (stringToFind, colour) {
    //crate div if necessary
//    if (!$("#myModal")) {
//        var modalSearch = '<div id="myModal" class="modal fade bd-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">';
//        modalSearch = modalSearch + '<div class="modal-dialog modal-sm">';
//        modalSearch += '<div class="modal-content">';
//        modalSearch += '  ...';
//        modalSearch += '</div>';
//        modalSearch += '</div>';
//        modalSearch += '</div>';
//        $('body').append(modalSearch);
//    }
//    $("#myModal").toggle();
    console.log("String to find:"+stringToFind);
    this.remenberPosition();
    var hasBackwardOccurence = true;
    while (hasBackwardOccurence) {
        hasBackwardOccurence = window.find(stringToFind, false, true);
        highlight(colour);
    }
    var hasForwardOccurence = true;
    while (hasForwardOccurence) {
        hasForwardOccurence = window.find(stringToFind, false, true);
        highlight(colour);
    }
    this.scrollToPosition();
};

// FICHIER 3

var defaultBoUrl = 'http://kush.fr';
var defaulthreshold = 1;
var defaultColor = "#f0dc2b";
var category = {
    SURFER: 1,
    ETUDIANT: 2,
    PROFESSIONNEL: 3,
}
var defaultCategory = category.SURFER;
var defaultSurferColor = "#151717";

var isHighlightEnable = false;
console.log("LOAD HIGHLIGHT.JS");
//document.addEventListener('DOMContentLoaded', function () {
var toolfind = new ToolFind();



toggleHighlight();

function clickHandler() {
    console.log("click");
    makeEditableAndHighlight(colour);
    var sel = window.getSelection();
    sel.removeAllRanges();
}

var colour = defaultColor;

//restore selection from the server


function makeEditableAndHighlight(colour) {
    var range, sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
    }

    if (range && range.toString() && range.toString().length > 0) {
        //save selected range
        var highlighted = storeSelection();
        console.log(highlighted);
        sel.addRange(range);
        doHighlightAndAddHandler(colour, -2);
    }
}

/**
 * Highlight the selection and after that remove the selection
 * @param {string} colour
 * @param {number} id of the highlight in the db (use to erase)
 * @param {boolean} canDelete if I am authorize to delete this highlight
 * @returns {void}
 */
function doHighlightAndAddHandler(colour, id, canDelete) {
    canDelete = typeof canDelete !== 'undefined' ? canDelete : true;
    document.designMode = "on";

    // use tmp color to avoid conflict
    var tmpColor = Colors.getTmpColor();
    // Use HiliteColor since some browsers apply BackColor to the whole block
    highlightSelection(tmpColor);

    console.log(document.queryCommandValue('BackColor'));
    //récupérer l objet span crée et ajouter le handler on click
    var highlighted = document.querySelectorAll("span[style*='background-color: " + Colors.hexToRgbString(tmpColor) + "']");
    console.log("span[style*='background-color: " + Colors.hexToRgbString(tmpColor) + "']");
    if (highlighted != null) {
        var i = 0;
        for (i = 0; i < highlighted.length; ++i) {
            //if (!highlighted[i].getAttribute("data-id")) {
            highlighted[i].setAttribute("data-id", id);
            highlighted[i].setAttribute("class", "highlighted");
            if (canDelete) {
                setDeleteHandler(highlighted[i]);
            } else {
                removeDeleteHandler(highlighted[i]);
            }
            //}
        }
    }
    highlightSelection(colour);
    document.designMode = "off";
}

function highlightSelection(colour) {
    if (!document.execCommand("HiliteColor", false, colour)) {
        document.execCommand("BackColor", false, colour);
    }
}

function setDeleteHandler(spanHighlightElement) {
    spanHighlightElement.setAttribute("style", spanHighlightElement.getAttribute("style") + " cursor:not-allowed");
    spanHighlightElement.addEventListener("contextmenu", deleteHandler);
}

function removeDeleteHandler(spanHighlightElement) {
    var style = spanHighlightElement.getAttribute("style");
    var newStyle = style.replace("cursor: not-allowed", "");
    spanHighlightElement.setAttribute("style", newStyle);
    spanHighlightElement.removeEventListener("contextmenu", deleteHandler);
}

function deleteHandler(event) {
    console.log("click on highlighted zone!");
    var dataId = this.getAttribute('data-id');
    this.setAttribute("style", "");
    var elts = document.querySelectorAll("[data-id='" + dataId + "']");
    for (var i = 0; i < elts.length; ++i) {
        elts[i].setAttribute("style", "");
    }
    removeHighlight(dataId);
    //TODO à discuter
    event.preventDefault();
}

function highlight(colour) {
    var range;
    if (window.getSelection) {
        // IE9 and non-IE
        try {
            if (!document.execCommand("BackColor", false, colour)) {
                makeEditableAndHighlight(colour);
            }
        } catch (ex) {
            makeEditableAndHighlight(colour)
        }
    } else if (document.selection && document.selection.createRange) {
        // IE <= 8 case
        range = document.selection.createRange();
        range.execCommand("BackColor", false, colour);
    }
}

function storeSelection() {
    if (typeof window.getSelection != 'undefined') {
        var selection = window.getSelection();
        var stringSelect = selection.toString();
        if (stringSelect) {
            var nbrOfPreviousOccurence = getNbrOfPreviousOccurence(stringSelect);
            var highlight = createHighlight(selection.toString(), nbrOfPreviousOccurence, window.location.href);
           
        }
    }
    return null;
}

function getNbrOfPreviousOccurence(stringSelect) {
    var nbrOfPreviousOccurence = 0;
    while (window.find(stringSelect, false, true)) {
        nbrOfPreviousOccurence++;
    }
    for (var i = 0; i < nbrOfPreviousOccurence; ++i) {
        window.find(stringSelect);
    }
    return nbrOfPreviousOccurence;
}


function highlightFromJsonData(data, groupSettings) {
    if (data != null) {
        if (typeof window.getSelection != 'undefined') {
            var selection = window.getSelection();
            for (var i = 0; i < data.length; ++i) {
                try {
                    var selectionDetails = data[i];
                    console.log(selectionDetails);
                    //par défaut couleur de l utilisateur
                    var colourUserOrGroup = colour;
                    if (selectionDetails.id_group != null) {
                        colourUserOrGroup = Colors.getColourForGroup(selectionDetails.id_group, groupSettings)
                    }
                    selectFromSelectionDetails(selectionDetails);
                    var canDeleteThis = canDelete(selectionDetails);
                    doHighlightAndAddHandler(colourUserOrGroup, selectionDetails.id, canDeleteThis);
                    selection.removeAllRanges();
                } catch (ex) {
                    console.log("Can't restore selection " + data[i].id);
                    console.log(ex.message);
                }
            }
        }
    }
}

function selectFromSelectionDetails(selectionDetails) {
    // var stringSelect = atob(selectionDetails.selection);
    var stringSelect = decodeURIComponent(escape(window.atob(selectionDetails.selection)));
    while (window.find(stringSelect, false, true)) {
    }
    var i = 0;
    while (i < selectionDetails.nbrOfPreviousOccurence) {
        window.find(stringSelect);
        i++;
    }
}

function canDelete(selectionDetails) {
    return (selectionDetails.admin_user == selectionDetails.me || !selectionDetails.id_group);
}


/******************************
 * 
 * Disable/enable highlight function
 */
//function addDisableChekbox() {
//    //remove event handler
//    $("body").append('<div id="disableBox123456" style="pointer-events: all" class="disable-box"><input id="disableCheckBox123456" style="pointer-events: all" type="checkbox" value="0" disabled></input> Disable'+
//        '</div>');
//    var tether = new Tether({
//        element: '#disableBox123456',
//        target: document.body,
//        attachment: 'top right',
//        targetAttachment: 'top right',
//        targetModifier: 'visible'
//    });
//    tether.position();
//    $("#disableCheckBox123456").click(clickDisableHandler);
//}
//
//function clickDisableHandler() {
//    console.log("clickDisableHandler");
//    console.log($("#disableCheckBox123456").value);
//    toggleHighlight();
//}

/********************************
 * Search part
 ********************************/

/**
 * Search box
 * @returns {undefined}
 */
function displaySearchBox() {
    //remove event handler
    if (isHighlightEnable)
        toggleHighlight();
    $("body").append('<div id="selectBox123456" class="search-box"  ><input id="textSearchBox123456" style="z-index:10000; pointer-events: all" type="text" value=""></input>' +
        '<input id="buttonHighlight123456" type="button" value="Highlight all&nbsp;&nbsp;" /></div>');
    var tether = new Tether({
        element: '#selectBox123456',
        target: document.body,
        attachment: 'top right',
        targetAttachment: 'top right',
        targetModifier: 'visible'
    });
    tether.position();
    $("#buttonHighlight123456").click(clickSearchHandler);
}

function clickSearchHandler() {
    console.log("clickSearchHandler");
    toolfind.findAndHighlight($("#textSearchBox123456")[0].value, Colors.get());
    makeEditableAndHighlight(colour);
    var sel = window.getSelection();
    sel.removeAllRanges();
    if (!isHighlightEnable)
        toggleHighlight();
    $("#selectBox123456").remove();
}

/**
 * Handler for extension message
 * @param {type} param
 */


function selectAllHighlightedNode() {
    var nodes = document.querySelectorAll(".highlighted");
    var selectedText = "";
    for (var i = 0; i < nodes.length; ++i) {
        var node = nodes[i];
        selectedText += node.innerText + '\r\n';
    };
    return selectedText;
}


/**
 * Add or remvoe event listener
 * 
 * @returns {undefined}
 */
function toggleHighlight() {
    if (isHighlightEnable === false) {
        document.addEventListener("click", clickHandler);
        isHighlightEnable = true;
    } else {
        document.removeEventListener("click", clickHandler);
        isHighlightEnable = false;
    }
}


/** Trash to dump comment **/








// AUTRE TEST 

function SetToBold () {
    window.find('mars').selectedText;
    document.body.contentEditable = true;
    document.execCommand ('hiliteColor', false, 'red');
    document.body.contentEditable = false;
  
}
document.body.addEventListener('mouseup',(e)=>{
    SetToBold();
    console.log(e)
})
document.getElementsByTagName('frame')[1].addEventListener('click', function(e){console.log("ola",e)})

window.find('mars');



//GG WP
function SetToBold () {
    document.body.contentEditable = true;
    document.execCommand ('bold', false, null);
    document.body.contentEditable = false;
}
document.body.addEventListener('mouseup',()=>{SetToBold()})

window.find('25 mars');


// CTRL + click
document.addEventListener('click', function(e){
    if(e.ctrlKey) {
        console.log('mais non');
    }
})