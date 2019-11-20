"use strict";

function checkLogged(response) {
    if (response.logged === true) {
        $("#question").addClass('hide');
    } else {
        $("#question").removeClass('hide');
    };
}


$.get("/check-logged.json", (response) => {
    checkLogged(response);
});