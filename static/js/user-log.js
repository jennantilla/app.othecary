// Select2 Search
$(document).ready(function() {
    $('#log-search').select2({
        ajax: {
            url: '/user_log.json',
            dataType: 'json',
            method: 'GET',
            data: (params) => { 
                return {'search_terms': params.term}   
            }
        },
        placeholder: 'Filter your logs by keyword'
        });
});

// Select2 Results
function seeInfo(results) {
    for (item in results) {
        let logDiv = document.createElement('p');
        logDiv.id = results[item]['log_id'];
        logDiv.innerHTML = results[item]['notes'];
        document.getElementById('log-report').appendChild(logDiv);
        
        if (results[item]['take_vitamin'] === true) {
            $(logDiv).html(`\n\n${'<i class="far fa-check-circle"></i>'} ${results[item]['date']}: ${results[item]['notes']}`)
        } else {
            $(logDiv).html(`\n\n${'<i class="far fa-times-circle"></i>'} ${results[item]['date']}: ${results[item]['notes']}`)
        };
    };
    }; 

$('#log-form').on('submit', (evt) => {
    evt.preventDefault();
    
    const formValues = $('#log-search').serialize();
    $.post('/see-log.json', formValues, seeInfo);

    });