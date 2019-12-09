'use strict';
// Calculator AJAX

function seeCalcResult(results) {
  $('#run-out-rslt').html(results['run-out'].slice(0,16));
  $('#run-out-dsply').removeClass('hide');
  $('#run-out-db').val(results['run-out']);
};

$('#calculator-inputs').on('submit', (evt) => {
  evt.preventDefault();

  const calcVals = $('#calculator-inputs').serialize();
  $.post('/calculator.json', calcVals, seeCalcResult);
});