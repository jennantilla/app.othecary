// Select2 search
$(document).ready(function() {
    $('.search-filter').select2({
        ajax: {
            url: '/vitamin-search.json',
            dataType: 'json',
            method: 'GET',
            data: (params) => { 
                return {'search_terms': params.term}   
            }
        },
        placeholder: "Narrow your search"
        });
});

// Function for AJAX call
function seeInfo(results) {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var today = year + "-" + month + "-" + day;

    $("#prod-name").html(results['name']);
    $("#brand-name").html("Brand name: " + results['brand']);
    $("#prod-cont").html("Contents: " + results['contents']);
    $("#prod-dir").html(results['use']);
    $("#prod-serv").html("Serving size: " + results['serving']);
    $("#prod-type").html("Product type: " + results['product_type']);
    $("#supp-form").html("Supplement form: " + results['supplement_form']);
    $("#targ-grp").html("Target group: " + results['group']);
    $("#the-canvas").removeClass('hide');
    $("#add-form").removeClass('hide');
    $("#calculator").removeClass('hide');
    $("#selected").val(results['id']);
    $("#label-id").val(results['id']);
    $("#supp-name").val(results['name']);
    $("#supp-content").val(results['contents']);
    $("#start").val(today);

    //Use the pdf.js library to view vitamin label
    let id = results['id'];
    var url = `https://cors-anywhere.herokuapp.com/https://www.dsld.nlm.nih.gov/dsld/docs/${id}.pdf`;
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
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
        var canvas = document.getElementById('the-canvas');
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
  }


// Event listener
$(".add-form").on('submit', (evt) => {
    evt.preventDefault();

    const formValues = $('.search-filter').serialize();
    $.post('/see-info.json', formValues, seeInfo);

    });