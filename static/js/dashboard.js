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