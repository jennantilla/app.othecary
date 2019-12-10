$.get("/user-vitamin-list.json", (res) => {
    function createVitamins() {
    for (item in res) {
        let suppDiv = document.createElement("DIV");
        suppDiv.id = res[item]["id"];
        suppDiv.className = "routine-items";

        if (res[item]["active"] === true) {
            document.getElementById("active-section").prepend(suppDiv);
        }
        else {
            document.getElementById("inactive").prepend(suppDiv);
            createDiscontinue("Discontinued on: " + 
                res[item]["discontinue_date"].slice(0,16), suppDiv.id);
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
        let h1 = document.createElement("H5");
        h1.className = "p-2 supp-head"
        let name1 = document.createTextNode(key);

        h1.appendChild(name1);
        document.getElementById(parentId).appendChild(h1);
    };

    function createDiscontinue(key, parentId) {
        let para = document.createElement("P");
        para.id = key;
        para.className = "discontinue-flag"
        let name2 = document.createTextNode(key);

        para.appendChild(name2);
        document.getElementById(parentId).appendChild(para);
    };

    function createDetails(key, parentId) {
        let para = document.createElement("P");
        para.id = key;
        let name2 = document.createTextNode(key);

        para.appendChild(name2);
        document.getElementById(parentId).appendChild(para);
    };

    function createButton(key, parentId) {
        let deactivateButton = document.createElement("BUTTON");
        deactivateButton.type = "image";
        deactivateButton.className = "mb-3 btn btn-primary btn-sm active-toggle"
        deactivateButton.id = "btn-" + key;
        deactivateButton.name = "clicked-btn";
        deactivateButton.value = key;

        if (res[item]["active"] === true) {
            let buttonLabel = document.createTextNode("Deactivate");
            deactivateButton.appendChild(buttonLabel);
            document.getElementById(parentId).appendChild(deactivateButton);
        }
        else {
            let buttonLabel = document.createTextNode("Reactivate");
            deactivateButton.appendChild(buttonLabel);
            document.getElementById(parentId).appendChild(deactivateButton);
        };
    };

        function makeRatingForm(key, rating, parentId) {
        let ratingForm = document.createElement("FORM");
        ratingForm.className = "ratings"
        ratingForm.id = "formRating-" + parentId;
        ratingForm.action = "/user_ratings.json"
        ratingForm.method = "POST"

        function createIdInput(parentId) {
            let labelId = document.createElement("INPUT");
            labelId.className = "hide";
            labelId.name = "id";
            labelId.value = parentId;
            ratingForm.appendChild(labelId);
        };

        function createCheckBox(num, rating, parentId) {
            let checkBox = document.createElement("INPUT");
            checkBox.type = "checkbox";
            checkBox.className = "hide";
            checkBox.id = parentId + "-star-" + num;
            checkBox.name = "rating";
            
            checkBox.value = num;

            if (checkBox.value <= rating) {
                checkBox.checked = "checked";
            };

            ratingForm.appendChild(checkBox);

            let newLabel = document.createElement("Label");
            newLabel.innerHTML = "<i class='fas fa-star'></i>";
            ratingForm.appendChild(newLabel);
            newLabel.setAttribute("for", checkBox.id);
            
        }; 

        createIdInput(parentId);
        createCheckBox(1, rating, parentId);
        createCheckBox(2, rating, parentId);
        createCheckBox(3, rating, parentId);
        createCheckBox(4, rating, parentId);
        createCheckBox(5, rating, parentId);

        let submitRating = document.createElement("INPUT");
        submitRating.type = "submit";
        submitRating.className = "m-1 btn btn-primary btn-sm";
        submitRating.id = "ratingSubmit"
        submitRating.value = "Update";
        ratingForm.appendChild(submitRating)

        document.getElementById(parentId).appendChild(ratingForm);
    }

    function makeCollapsible() {
        let collapse = document.getElementsByClassName("collapsible");
        let i;

        for (i = 0; i < collapse.length; i++) {
          collapse[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
              content.style.display = "none";
            } else {
              content.style.display = "block";
            }
          });
        }
    }

    function moveDiv() {
        let buttons = document.querySelectorAll('.active-toggle');
        for (let i=0; i<buttons.length; ++i) {
          buttons[i].addEventListener('click', clickFunc);
        }

        function clickFunc() {
            let formValues = this.value;
    //add a callback
            $.post('/remove-routine.json', formValues)
            for (item in res) {
                if (res[item]["active"] === true) {
                    $(`#${formValues}`).appendTo('#inactive');
                    let btnId = document.getElementById("btn-" + formValues);
                    btnId.innerText = btnId.textContent = "Reactivate";
                    $(".discontinue-flag").removeClass('hide')

                } else {
                    $(`#${formValues}`).appendTo('#active-section');
                    let btnId = document.getElementById("btn-" + formValues);
                    btnId.innerText = btnId.textContent = "Deactivate";
                    $(".discontinue-flag").addClass('hide')
                }; 
                }   
            };
    }

    createVitamins();
    makeCollapsible();
    moveDiv();
    });


function addToActives(response) {
    let newDiv = document.createElement("DIV");
        newDiv.id = response['id'];
        newDiv.className = "routine-items";
        document.getElementById("active-section").prepend(newDiv);

    let newH = document.createElement("H5");
        newH.className = "p-2 supp-head";
        newH.id = "newHead"
        let newName = document.createTextNode(response['name'] + " ");
        newH.appendChild(newName);
        let newBadge = document.createElement("SPAN");
        newBadge.className = "badge badge-secondary";
        newH.appendChild(newBadge)
        newBadge.innerHTML = "NEW";
        document.getElementById(response['id']).appendChild(newH);

    let newPara = document.createElement("P");
        newPara.id = response['id'];
        let newName2 = document.createTextNode(response['use']);
        newPara.appendChild(newName2);
        document.getElementById(response['id']).appendChild(newPara);

    let newPara2 = document.createElement("P");
        newPara2.id = response['id'];
        let newName3 = document.createTextNode("Start date: " + response['start'].slice(0,16));

        newPara2.appendChild(newName3);
        document.getElementById(response['id']).appendChild(newPara2);

    let newPara3 = document.createElement("P");
        newPara3.id = response['id'];
        let newName4 = document.createTextNode("You will run out on: " + response['run_out'].slice(0,16));

        newPara3.appendChild(newName4);
        document.getElementById(response['id']).appendChild(newPara3);

    let addAlert = document.createElement('DIV');
            addAlert.className = 'alert alert-warning';
            addAlert.role = 'alert';
            addAlert.innerHTML = `${response['name']} was added to your routine!`;
            document.getElementById('low-alert').appendChild(addAlert);
    };


$("#add-spotlight").on("click", (evt) =>{
    evt.preventDefault(); 
    const formValues = $('#add-spotlight').serialize();
    
    $.post('/add-routine.json', formValues, addToActives);
    $('#supp-spotlight').addClass('hide');

})