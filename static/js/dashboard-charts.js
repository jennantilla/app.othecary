"use strict";
const options = {
    responsive: true
};

let ctx_bar = $("#successChart").get(0).getContext("2d");

$.get("/success.json", function (data) {
    let mySuccessChart = new Chart(ctx_bar, {
                                        type: "doughnut",
                                        data: data,
                                        options: options
                                        });
    });


let ctx_donut = $("#productTypeChart").get(0).getContext("2d");

$.get("/product-type.json", function (data) {
    let myProductChart = new Chart(ctx_donut, {
                                        type: "doughnut",
                                        data: data,
                                        options: options
                                        });
    });