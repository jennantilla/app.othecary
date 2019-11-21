"use strict";

const options = {
    responsive: true
};

let ctx_donut = $("#productTypeChart").get(0).getContext("2d");

$.get("/product-type.json", function (data) {
    let myProductChart = new Chart(ctx_donut, {
                                        type: "pie",
                                        data: data,
                                        options: options
                                        });
    });