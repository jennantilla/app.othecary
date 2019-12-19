'use strict';
// Hide/show streak question depending on whether user has logged that day
function checkLogged(response) {
    if (response.logged === true) {
        $('#question').addClass('hide');
    } else {
        $('#question').removeClass('hide');
    };
}

$.get('/check-logged.json', (response) => {
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
            let lowAlert = document.createElement('DIV');
            lowAlert.id = `run-low-${response[vitamin]['name']}`;
            lowAlert.className = 'alert alert-warning';
            lowAlert.role = 'alert';
            lowAlert.innerHTML = `You are running low on ${response[vitamin]['name']}. Refill soon so you don't break your streak!`;
            document.getElementById('low-alert').appendChild(lowAlert);
        };   
    }; 
} 

$.get('/user-vitamin-list.json', (response) => {
    checkDate(response);
});

// Retrieves a suggested supplement & photo to spotlight
$('#loading').html('<i class="fas fa-spinner fa-2"></i>');

$.get('/suggestions.json', (res) => {
        $('#spotlight').html(res.name);
        $('#info').html(res.use);
        $('.spot-id').attr('value', res.id);
        $('.spot-run').attr('value', (new Date(2020, 0, 11).toISOString().substr(0, 10)));

        let id = res.id;
        var url = `https://cors-anywhere.herokuapp.com/https://www.dsld.nlm.nih.gov/dsld/docs/${id}.pdf`;

        var pdfjsLib = window['pdfjs-dist/build/pdf'];

        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

        // Asynchronous download of PDF
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
          console.log('PDF loaded');
          
          // Fetch the first page
          var pageNumber = 1;
          pdf.getPage(pageNumber).then(function(page) {
            console.log('Page loaded');
            
            var scale = 1.5;
            var viewport = page.getViewport({scale: scale});

            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById('spot-photo');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
              console.log('Page rendered');
            });
          });
        }, function (reason) {
          // PDF loading error
          console.error(reason);
        });
        $('#loading').empty();
});

function addToActives(response) {
    let newDiv = document.createElement('DIV');
        newDiv.id = response['id'];
        newDiv.className = 'routine-items';
        document.getElementById('active-section').prepend(newDiv);

    let newH = document.createElement('H5');
        newH.className = 'p-2 supp-head';
        newH.id = 'newHead'
        let newName = document.createTextNode(response['name'] + ' ');
        newH.appendChild(newName);
        let newBadge = document.createElement('SPAN');
        newBadge.className = 'badge badge-secondary';
        newH.appendChild(newBadge)
        newBadge.innerHTML = 'NEW';
        document.getElementById(response['id']).appendChild(newH);

    let newPara = document.createElement('P');
        newPara.id = response['id'];
        let newName2 = document.createTextNode(response['use']);
        newPara.appendChild(newName2);
        document.getElementById(response['id']).appendChild(newPara);

    let newPara2 = document.createElement('P');
        newPara2.id = response['id'];
        let newName3 = document.createTextNode('Start date: ' + response['start'].slice(0,16));

        newPara2.appendChild(newName3);
        document.getElementById(response['id']).appendChild(newPara2);

    let newPara3 = document.createElement('P');
        newPara3.id = response['id'];
        let newName4 = document.createTextNode('You will run out on: ' + response['run_out'].slice(0,16));

        newPara3.appendChild(newName4);
        document.getElementById(response['id']).appendChild(newPara3);

    let addAlert = document.createElement('DIV');
            addAlert.className = 'alert alert-warning';
            addAlert.role = 'alert';
            addAlert.innerHTML = `${response['name']} was added to your routine!`;
            document.getElementById('low-alert').appendChild(addAlert);
    };


$('#add-spotlight').on('click', (evt) =>{
    evt.preventDefault(); 
    const formValues = $('#add-spotlight').serialize();
    
    $.post('/add-routine.json', formValues, addToActives);
    $('#supp-spotlight').addClass('hide');

})

// page formatting //
$('.externallink').remove();

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})