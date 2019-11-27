// Dynamically create a collapsible button for all <h2> elements
var id = 1;
$('h2').each(function(){
    $(this).attr("id", "header" + id);
    createButton(id);
    id++;
});

function createButton(headerNum) {
    var expandButton = document.createElement("BUTTON");

    var buttonLabel = document.createTextNode("Read more");
    expandButton.appendChild(buttonLabel);
    document.getElementById(`header${headerNum}`).appendChild(expandButton);
}

$("button").addClass("collapsible")

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


// Formatting of body
$(".externallink").remove();

// Select2 plugin
$(document).ready(function() {
    $('.search-filter').select2({
        ajax: {
            url: '/vitamin-search.json',
            dataType: 'json',
            method: 'GET',
            data: (params) => { 
                return {'search_terms': params.term}   
            }
        },
        placeholder: "Narrow your search"
        });
});

