"use strict";

function replaceStreak(results) {

    $("#streak-info").html(results['streak']);
}

$("#performance").on('submit', (evt) => {
    evt.preventDefault();

    const formValues = $('#performance').serialize();
    $.post('/update-streak.json', formValues, replaceStreak);

    $("#question").addClass('hide');    

    });

$("#deactivate").on("submit", (evt) => {
    evt.preventDefault();

    const formAnswer = $('#remove').serialize();
    $.post('/dashboard/1', formAnswer);

    $("#routine-item").appendTo('#inactive');
    // find the list of active stuff

    // find the elemtn we want to remove in that list

    // find the list of inactive stuff
    // add the elemebnt to the list of inactive 
    // remove the element from the list of active



    });