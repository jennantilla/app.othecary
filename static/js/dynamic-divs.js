$.get("/user-vitamin-list.json", (res) => {
    function createVitamins() {
    for (item in res) {
        var lst = document.createElement("DIV");
        lst.id = res[item]["id"];

        if (res[item]["active"] === true) {
            document.getElementById("wrapper").appendChild(lst);
        }
        else {
            document.getElementById("inactive").appendChild(lst);
        };

        createHeader(res[item]["name"], lst.id);
        createDetails(res[item]["serving_size"] + " " + res[item]["serving_unit"], lst.id);
        createDetails(res[item]["use"], lst.id);
        createDetails(res[item]["start_date"].slice(0,16), lst.id);
        createDetails(res[item]["run_out"].slice(0,16), lst.id);
        createButton(res[item]["id"], lst.id)
    };
};

function createHeader(key, parentId) {
    var h1 = document.createElement("H4");
    var name1 = document.createTextNode(key);

    h1.appendChild(name1);
    document.getElementById(parentId).appendChild(h1);
};

function createDetails(key, parentId) {
    var li1 = document.createElement("P");
    var name2 = document.createTextNode(key);

    li1.appendChild(name2);
    document.getElementById(parentId).appendChild(li1);
};

function createButton(key, parentId) {
    var deactivateButton = document.createElement("BUTTON");
    deactivateButton.id = "btn-" + key;
    deactivateButton.name = "clicked-btn";
    deactivateButton.value = key;
    deactivateButton.action = "/remove-routine.json";

    if (res[item]["active"] === true) {
        var buttonLabel = document.createTextNode("Deactivate");
        deactivateButton.appendChild(buttonLabel);
        document.getElementById(parentId).appendChild(deactivateButton);
    }
    else {
        var buttonLabel = document.createTextNode("Reactivate");
        deactivateButton.appendChild(buttonLabel);
        document.getElementById(parentId).appendChild(deactivateButton);
    };
}


createVitamins();

var buttons = document.querySelectorAll('button');
for (var i=0; i<buttons.length; ++i) {
  buttons[i].addEventListener('click', clickFunc);
}

function clickFunc() {
    let formValues = this.value;

    $.post('/remove-routine.json', formValues);

    $(`#${formValues}`).appendTo('#inactive');
    let btnId = document.getElementById("btn-" + formValues);
    btnId.innerText = btnId.textContent = "Reactivate";     

    };

});