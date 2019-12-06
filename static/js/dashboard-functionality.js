"use strict";
// Hide/show streak question depending on whether user has logged that day
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



// Checks to see any of user's run-out dates are within a week. If so, alert them
function checkDate(response) {

    for (const vitamin in response) {
        const today = new Date();
        const runOut = response[vitamin]['run_out'];
        const emptyDate = new Date(runOut);

        var timeDiff = Math.abs(today.getTime() - emptyDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (diffDays > 0 && diffDays < 5) {
            let lowAlert = document.createElement("DIV");
            lowAlert.id = "running-low";
            lowAlert.className = "alert alert-warning";
            lowAlert.role = "alert";
            lowAlert.innerHTML = `You are running low on ${response[vitamin]['name']}. Refill soon so you don't break your streak!`;
            document.getElementById("low-alert").appendChild(lowAlert);
        };   
    };  
} 

$.get("/user-vitamin-list.json", (response) => {
    checkDate(response);
});



// Retrieves a suggested supplement to spotlight
$.get("/suggestions.json", (res) => {
    $("#spotlight").html(res.name);
    $("#info").html(res.use);
    $(".spot-id").attr("value", res.id);
    $(".spot-run").attr("value", (new Date().toISOString().substr(0, 10)));
});


