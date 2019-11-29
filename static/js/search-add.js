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
    $("#selected").val(results['id']);

    let id = results['id'];

    var url = `https://cors-anywhere.herokuapp.com/https://www.dsld.nlm.nih.gov/dsld/docs/${id}.pdf`;


    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    var pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 0.8,
        canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
      pageRendering = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });

      // Update page counters
      document.getElementById('page_num').textContent = num;
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }
    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById('page_count').textContent = pdfDoc.numPages;

      // Initial/first page rendering
      renderPage(pageNum);
    });
    }

// Event listener
$(".add-form").on('submit', (evt) => {
    evt.preventDefault();

    const formValues = $('.search-filter').serialize();
    $.post('/see-info.json', formValues, seeInfo);

    });