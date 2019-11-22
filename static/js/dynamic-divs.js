$.get("/user-vitamin-list.json", (res) => {
    function createVitamins() {
    for (item in res) {
        var lst = document.createElement("DIV");
        lst.id = res[item]["uv_id"];
        document.getElementById("wrapper").appendChild(lst);

        createHeader(res[item]["name"], lst.id);
        createDetails(res[item]["serving_unit"], lst.id);
        createDetails(res[item]["use"], lst.id);
        createDetails(res[item]["start_date"].slice(0,16), lst.id);
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
    deactivateButton.id = key
    var buttonLabel = document.createTextNode("Deactivate");

    deactivateButton.appendChild(buttonLabel);
    document.getElementById(parentId).appendChild(deactivateButton);
};



createVitamins();
});






    
    // var li1 = document.createElement("LI");
    // var name2 = document.createTextNode(res.serving_unit);

    // li1.appendChild(name2);
    // document.getElementById("wrapper").appendChild(lst);

    // $('#hmm').html(res.name);
    // $('#wow').html(res.serving_size + res.serving_unit);
