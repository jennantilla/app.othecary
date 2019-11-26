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
    deactivateButton.id = key
    deactivateButton.name = "clicked-btn"
    deactivateButton.value = key
    deactivateButton.action = "/remove-routine.json"
    var buttonLabel = document.createTextNode("Deactivate");

    deactivateButton.appendChild(buttonLabel);
    document.getElementById(parentId).appendChild(deactivateButton);
}


createVitamins();
var buttons = document.querySelectorAll('button');
for (var i=0; i<buttons.length; ++i) {
  buttons[i].addEventListener('click', clickFunc);
}

function clickFunc() {
    let formValues = this.id;

    $.post('/remove-routine.json', formValues);

    $(`#${formValues}`).appendTo('#inactive');    

    };

});




// $.get("/user-vitamin-list.json", (res) => {
//     function createVitamins() {
//     for (item in res) {
//         var lst = document.createElement("DIV");
//         lst.id = res[item]["id"];
        
//         if (res[item]["active"] === true) {
//             document.getElementById("wrapper").appendChild(lst);
//         }
//         else {
//             document.getElementById("inactive").appendChild(lst);
//         }

        
//         createHeader(res[item]["name"], lst.id);
//         createDetails(res[item]["serving_size"] + " " + res[item]["serving_unit"], lst.id);
//         createDetails(res[item]["use"], lst.id);
//         createDetails(res[item]["start_date"].slice(0,16), lst.id);
//         createDetails(res[item]["run_out"].slice(0,16), lst.id);
//         createForm(res[item]["id"], lst.id)
//         createButton(res[item]["id"], lst.id)
//     };
// };

// function createHeader(key, parentId) {
//     var h1 = document.createElement("H4");
//     var name1 = document.createTextNode(key);

//     h1.appendChild(name1);
//     document.getElementById(parentId).appendChild(h1);
// };

// function createDetails(key, parentId) {
//     var li1 = document.createElement("P");
//     var name2 = document.createTextNode(key);

//     li1.appendChild(name2);
//     document.getElementById(parentId).appendChild(li1);
// };

// function createForm(key, parentId) {
//     var deactiveForm = document.createElement("FORM");
//     deactiveForm.id = "deactive-form" + parentId;
//     deactiveForm.action = "/remove-routine.json";
//     deactiveForm.method = "POST";
//     document.getElementById(parentId).appendChild(deactiveForm);
// }

// function createButton(key, parentId) {
//     var deactivateButton = document.createElement("INPUT");
//     deactivateButton.type = "submit";
//     deactivateButton.id = "clicked-btn";
//     deactivateButton.name = "clicked-btn";
//     deactivateButton.value = key;

//     var buttonLabel = document.createTextNode("Deactivate");
//     deactivateButton.appendChild(buttonLabel);
//     document.getElementById("deactive-form" + parentId).appendChild(deactivateButton);
    
// }


// createVitamins();

// $("#deactive-form10777").on('submit', (evt) => {
//     evt.preventDefault();
//     evt.stopPropagation();

//     const formValues = $('clicked-btn').serialize();
//     console.log(formValues)

//     $.post('/remove-routine.json', formValues);

//     $(`#${formValues}`).appendTo('#inactive');    

//     });

// var buttons = document.querySelectorAll('button');
// for (var i=0; i<buttons.length; ++i) {
//   buttons[i].addEventListener('submit', (evt) => {
//     evt.preventDefault();
//     let formValues = this.id;

//     $.post('/remove-routine.json', formValues);
//     $(`#${formValues}`).addClass('inactive'); 
//     $(`#${formValues}`).appendTo('#inactive');    

//     });

// }
    

// });