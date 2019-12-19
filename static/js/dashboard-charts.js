'use strict';
Chart.pluginService.register({
  beforeDraw: function(chart) {
    var width = chart.chart.width,
        height = chart.chart.height,
        ctx = chart.chart.ctx,
        type = chart.config.type;

      var percent = Math.round((chart.config.data.datasets[0].data[0] * 100) /
                    (chart.config.data.datasets[0].data[0] +
                    chart.config.data.datasets[0].data[1]));
      var oldFill = ctx.fillStyle;
      var fontSize = ((height - chart.chartArea.top) / 100).toFixed(2);

      ctx.restore();
      ctx.font = fontSize + 'em sans-serif';
      ctx.textBaseline = 'middle'

      var text = percent + '% success',
          textX = Math.round((width - ctx.measureText(text).width) / 2),
          textY = (height + chart.chartArea.top) / 2;

      ctx.fillStyle = chart.config.data.datasets[0].backgroundColor[0];
      ctx.fillText(text, textX, textY);
      ctx.fillStyle = oldFill;
      ctx.save();
  }
});


let ctx_dial = $('#successChart').get(0).getContext('2d');

$.get('/success.json', function (data) {
    let mySuccessChart = new Chart(ctx_dial, {
                                        type: 'doughnut',
                                        data: data,
                                        options: {
                                            cutoutPercentage:85,
                                            rotation:1*Math.PI,
                                            circumference: 1 * Math.PI
                                        },
                                        });
    });