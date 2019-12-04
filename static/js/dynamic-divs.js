$.get("/user-vitamin-list.json", (res) => {
    function createVitamins() {
    for (item in res) {
        var lst = document.createElement("DIV");
        lst.id = res[item]["id"];
        lst.className = "routine-items";

        if (res[item]["active"] === true) {
            document.getElementById("active-section").appendChild(lst);
        }
        else {
            document.getElementById("inactive").appendChild(lst);
        };

        createHeader(res[item]["name"], lst.id);
        makeRatingForm(res[item]["id"], lst.id)
        createDetails(res[item]["use"], lst.id);
        createDetails("Start date: " + res[item]["start_date"].slice(0,16), lst.id);
        createDetails("You will run out on: " + res[item]["run_out"].slice(0,16), lst.id);
        createButton(res[item]["id"], lst.id)
    };
    };

    function createHeader(key, parentId) {
        var h1 = document.createElement("H5");
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
        deactivateButton.type = "image";
        deactivateButton.className = "m-1 btn btn-primary btn-sm"
        deactivateButton.id = "btn-" + key;
        deactivateButton.name = "clicked-btn";
        deactivateButton.value = key;

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
    };

    function makeRatingForm(key, parentId) {
        var ratingForm = document.createElement("FORM");
        ratingForm.className = "ratings"
        ratingForm.id = "formRating-" + parentId;
        ratingForm.action = "/user_ratings.json"
        ratingForm.method = "POST"

        function createIdInput(parentId) {
            var labelId = document.createElement("INPUT");
            labelId.className = "hide";
            labelId.name = "id";
            labelId.value = parentId;
            ratingForm.appendChild(labelId);
        };

        function createRadio(num, parentId) {
            
            var newLabel = document.createElement("Label");
            newLabel.innerHTML = "<i class='fas fa-star'></i>";
            ratingForm.appendChild(newLabel);

            var radio = document.createElement("INPUT");
            radio.type = "radio";
            radio.className = "hide"
            radio.id = parentId + "-star-" + num;
            radio.name = "rating";
            radio.value = num;

            newLabel.setAttribute("for", radio.id);
            ratingForm.appendChild(radio);
        }; 

        createIdInput(parentId);
        createRadio(1, parentId);
        createRadio(2, parentId);
        createRadio(3, parentId);
        createRadio(4, parentId);
        createRadio(5, parentId);

        var submitRating = document.createElement("INPUT");
        submitRating.type = "submit";
        submitRating.className = "m-1 btn btn-primary btn-sm";
        submitRating.id = "ratingSubmit"
        submitRating.value = "Update rating";
        ratingForm.appendChild(submitRating)

        document.getElementById(parentId).appendChild(ratingForm);
    }

    function makeCollapsible() {
        var collapse = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < collapse.length; i++) {
          collapse[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
              content.style.display = "none";
            } else {
              content.style.display = "block";
            }
          });
        }
    }

    function moveDiv(chart) {
        var buttons = document.querySelectorAll('button');
        for (var i=0; i<buttons.length; ++i) {
          buttons[i].addEventListener('click', clickFunc);
        }

        function clickFunc() {
            let formValues = this.value;
    //add a callback
            $.post('/remove-routine.json', formValues);
            for (item in res) {
                if (res[item]["active"] === true) {
                    $(`#${formValues}`).appendTo('#inactive');
                    let btnId = document.getElementById("btn-" + formValues);
                    btnId.innerText = btnId.textContent = "Reactivate";
                } else {
                    $(`#${formValues}`).appendTo('#active-section');
                    let btnId = document.getElementById("btn-" + formValues);
                    btnId.innerText = btnId.textContent = "Deactivate";
                }; 
                }    
            };
    }

    createVitamins();
    makeCollapsible();
    moveDiv();

    });