// Formatting of body
$(".externallink").remove();

// Select2 plugin
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

