$.get("/user-vitamin-list.json", (res) => {
    function createVitamins() {
    for (item in res) {
        var suppDiv = document.createElement("DIV");
        suppDiv.id = res[item]["id"];
        suppDiv.className = "routine-items";

        if (res[item]["active"] === true) {
            document.getElementById("active-section").appendChild(suppDiv);
        }
        else {
            document.getElementById("inactive").appendChild(suppDiv);
        };

        createHeader(res[item]["name"], suppDiv.id);
        makeRatingForm(res[item]["id"], res[item]["rating"], suppDiv.id)
        createDetails(res[item]["use"], suppDiv.id);
        createDetails("Start date: " + res[item]["start_date"].slice(0,16), suppDiv.id);
        createDetails("You will run out on: " + res[item]["run_out"].slice(0,16), suppDiv.id);
        createButton(res[item]["id"], suppDiv.id)
    };
    };

    function createHeader(key, parentId) {
        var h1 = document.createElement("H5");
        h1.className = "p-2 supp-head"
        var name1 = document.createTextNode(key);

        h1.appendChild(name1);
        document.getElementById(parentId).appendChild(h1);
    };

    function createDetails(key, parentId) {
        var para = document.createElement("P");
        var name2 = document.createTextNode(key);

        para.appendChild(name2);
        document.getElementById(parentId).appendChild(para);
    };

    function createButton(key, parentId) {
        var deactivateButton = document.createElement("BUTTON");
        deactivateButton.type = "image";
        deactivateButton.className = "mb-3 btn btn-primary btn-sm"
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

        function makeRatingForm(key, rating, parentId) {
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

        function createRadio(num, rating, parentId) {
            var radio = document.createElement("INPUT");
            radio.type = "radio";
            radio.className = "hide"
            radio.id = parentId + "-star-" + num;
            radio.name = "rating";
            radio.value = num;

            if (radio.value <= rating) {
                radio.checked = "checked";
            };
            ratingForm.appendChild(radio);

            var newLabel = document.createElement("Label");
            newLabel.className = "active"
            newLabel.innerHTML = "<i class='fas fa-star'></i>";
            ratingForm.appendChild(newLabel);
            

            newLabel.setAttribute("for", radio.id);
            
        }; 

        createIdInput(parentId);
        createRadio(1, rating, parentId);
        createRadio(2, rating, parentId);
        createRadio(3, rating, parentId);
        createRadio(4, rating, parentId);
        createRadio(5, rating, parentId);

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