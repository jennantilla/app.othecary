"use strict";

function replaceStreak(results) {

    $("#streak-info").html(results['streak']);
    $("#success-number").html(results['success']);
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
    $.post('/remove-routine.json', formAnswer);

    $("#routine-item").appendTo('#inactive');
    });