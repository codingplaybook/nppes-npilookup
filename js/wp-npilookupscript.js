    /*
    * Run request for NPI Registry Lookup
    * 
    */

   jQuery(document).ready(function($){
    //console.log('I\'m ready new');
    
    // Identity Verification Lookup Functions for Form ID 62 - Full Intake
    // displaying one question at a time....start from index 0. Buttons will be used to increase/decrease
    
    // Empty array to save returned search results. Will be used to call index to autopopulate form
    var dr_list = [];
    var dr_index = 0;
    var null_catch = 0;

    var form_id, fname, lname, city, state, zip, phone, alt_phone, npi_num, npi_name, npi_street, npi_state, npi_phone, npi_fax, search, dr_results, select_dr;

    // Reduce zip code to 5-digits
    function shortZip(zip){
        var newStr = zip.slice(0,5);
        return newStr;
    }

    // Fields Associated with Gravity Form ID 62 - Full Intake - Adrian Edit
    $(`${select_dr}`).on('change', function() {

        // when the value changes set a new index point
        var select = document.getElementById(`${select_dr}`);
        dr_index = select.selectedIndex - 1;

        // when the value changes display the new verify info
        if(select.selectedIndex !== 0) {


            // Display Doctor Information to verify
            $("#wp_npi_selected").html(`
            <span>${dr_list[dr_index].basic.first_name + ' ' + dr_list[dr_index].basic.last_name}</span><br />
            <span>${dr_list[dr_index].addresses[0].address_1}&nbsp;${dr_list[dr_index].addresses[0].address_2}</span><br />
            <span>${dr_list[dr_index].addresses[0].city},&nbsp;${dr_list[dr_index].addresses[0].state}&nbsp;${shortZip(dr_list[dr_index].addresses[0].postal_code)}</span><br />
            <span>P: ${dr_list[dr_index].addresses[0].telephone_number}</span><br />
            ${dr_list[dr_index].addresses[0].fax_number ? 
                `<span>F:&nbsp;${dr_list[dr_index].addresses[0].fax_number}</span>` 
            : ''}
            `);

            //Set variables to be used for NPI fields

        }
        else {
            $("#wp_npi_selected").html('');
        }

        return dr_index;

    });

    $("#wp_npi_notfound").click(function(){
        // Set to Manual Entry
        $(`${search}_1`).prop("checked", true).change();

        // Clear all fields except lname/city/state
        $(`${fname}`).val('').change();
        $(`${zip}`).val('').change();
        $(`${phone}`).val('').change();
        $(`${alt_phone}`).val('').change();
        $(`${npi_num}`).val('').change();
        $(`${npi_name}`).val('').change();
        $(`${npi_street}`).val('').change();
        $(`${npi_state}`).val('').change();
        $(`${npi_phone}`).val('').change();
        $(`${npi_fax}`).val('').change();
    });

    function npi_run(){

        // Change text to let user know form is searching for NNPES registry
        $('#wp_npi_searching').html('Searching').change();

        // Clear all fields except lname/city/state
        $(`${fname}`).val('').change();
        $(`${zip}`).val('').change();
        $(`${phone}`).val('').change();
        $(`${alt_phone}`).val('').change();
        $(`${npi_num}`).val('').change();
        $(`${npi_name}`).val('').change();
        $(`${npi_street}`).val('').change();
        $(`${npi_state}`).val('').change();
        $(`${npi_phone}`).val('').change();
        $(`${npi_fax}`).val('').change();

        // Empty searched options and add defaults
        $(`${select_dr}`)
        .empty()
        .append(new Option('Select Doctor', 'Select Doctor'))
        .css("background", "none")
        .attr("size", "5").change();
        
        //Store fields for searching
        lname = $(`${lname}`).val();
        city = $(`${city}`).val();
        state = $(`${state}`).val();

        //console.log('search data: ', lname, city, state);

        $.post(wp_ajax_obj.ajax_url,{
            _ajax_nonce: wp_ajax_obj.nonce,
            action: "wp_npilookup", lname, city, state
        },
            function(data){
                //console.log(data);

                if(data === null || data === undefined){
                    if(null_catch >= 2){
                        $(`${dr_results}_1`).prop("checked", true).change();
                        $('#wp_npi_searching').html('No Results Found').change();
                    }
                    null_catch++;
                    npi_run();
                }
                else if(data.results && data.result_count > 0) {
                    $("#wp_npi_searching").html('Results Found').change();
                    $(`${search}_2`).prop("checked", true).change();
                    $(`${dr_results}_0`).prop("checked", true).change();
                    for(var i=0; i < data.results.length; i++) {
                        dr_list[i] = data.results[i];
                        $(`${select_dr}`).append(new Option(data.results[i].basic.first_name + ' ' + data.results[i].basic.last_name + ' | ' + data.results[i].addresses[0].address_1 + ' ' + data.results[i].addresses[0].address_2 + ' ' + data.results[i].addresses[0].city + ', ' + data.results[i].addresses[0].state + ' ' + shortZip(data.results[i].addresses[0].postal_code),i)).change();
                    }

                }
                else {
                    // choice_62_55_1
                    $(`${dr_results}_1`).prop("checked", true).change();
                    $('#wp_npi_searching').html('No Results Found').change();
                }
            }
        );

    }

    $("#wp_npi_confirmed").html(`
        <span>${$(`${npi_name}`).val()}</span><br />
        <span>${$(`${npi_street}`).val()}</span><br />
        <span>${$(`${npi_state}`).val()}</span><br />
        <span>P: ${$(`${phone}`).val()}</span><br />
        ${$(`${npi_fax}`).val() ? 
            `<span>F:&nbsp;${$(`${npi_fax}`).val()}</span>` 
        : ''}
    `).change();

    // Go back to original search
    $("#wp_npi_searchagain").click(function(){
        $('#wp_npi_searching').html('').change();
        $(`${search}_0`).prop("checked", true).change();

        // Clear fields
        $(`${npi_num}`).val('').change();
        $(`${npi_name}`).val('').change();
        $(`${npi_street}`).val('').change();
        $(`${npi_state}`).val('').change();
        $(`${phone}`).val('').change();
        $(`${npi_fax}`).val('').change();
        
    });

    // Final confirmation
    $("#wp_npi_confirm").click(function(){

        var sel = dr_list[dr_index];

        // Set form to confirmed
        $(`${search}_3`).prop("checked", true).change();

        // Fill out rest of fields
        // Change all normal fields
        $(`${fname}`).val(sel.basic.first_name).change();
        $(`${lname}`).val(sel.basic.last_name).change();
        $(`${city}`).val(sel.addresses[0].city).change();
        $(`${state}`).val(sel.addresses[0].state).change();
        $(`${zip}`).val(sel.addresses[0].postal_code).change();
        $(`${phone}`).val(sel.addresses[0].telephone_number).change();
        
        // Change all NPI fields
        $(`${npi_num}`).val(sel.number).change();
        $(`${npi_name}`).val(sel.basic.first_name + ' ' + sel.basic.last_name).change();
        $(`${npi_street}`).val(sel.addresses[0].address_1 + ' ' + sel.addresses[0].address_2).change();
        $(`${npi_state}`).val(sel.addresses[0].city + ', ' + sel.addresses[0].state + ' ' + shortZip(sel.addresses[0].postal_code)).change();
        $(`${npi_phone}`).val(sel.addresses[0].telephone_number).change();
        $(`${npi_fax}`).val(sel.addresses[0].fax_number).change();

        // Display Doctor Information again
        $("#wp_npi_confirmed").html(`
        <span>${sel.basic.first_name + ' ' + sel.basic.last_name}</span><br />
        <span>${sel.addresses[0].address_1}&nbsp;${sel.addresses[0].address_2}</span><br />
        <span>${sel.addresses[0].city},&nbsp;${sel.addresses[0].state}&nbsp;${shortZip(sel.addresses[0].postal_code)}</span><br />
        <span>P: ${sel.addresses[0].telephone_number}</span><br />
        ${sel.addresses[0].fax_number ? 
            `<span>F:&nbsp;${sel.addresses[0].fax_number}</span>` 
        : ''}
        `).change();

        $("#wp_npi_confirmed").html(`
        <span>${$(npi_name).val()}</span><br />
        <span>${$(npi_street).val()}</span><br />
        <span>${$(npi_state).val()}</span><br />
        <span>P: ${$(phone).val()}</span><br />
        ${$(npi_fax).val() ? 
            `<span>F:&nbsp;${$(npi_fax).val()}</span>` 
        : ''}
        `).change();
    });

    form_id = String($("#wp_npi_search").attr("name")); 
    console.log('form id = ', form_id);

    /**
     * Examples of input values based off their id numbers
    */


    if(form_id === '63') {
        fname = "#input_63_222"; 
        lname = "#input_63_223"; 
        city = "#input_63_224"; 
        state = "#input_63_225"; 
        zip = "#input_63_226"; 
        phone = "#input_63_227"; 
        alt_phone = "#input_63_228"; 
        npi_num = "#input_63_234"; 
        npi_name = "#input_63_235"; 
        npi_street = "#input_63_236"; 
        npi_state = "#input_63_237"; 
        npi_phone = "#input_63_238"; 
        npi_fax = "#input_63_239"; 
        search = "#choice_63_217"; 
        dr_results = "#choice_63_218"; 
        select_dr = "#input_63_219";
    } else if(form_id === '67') {
        fname = "#input_67_222"; 
        lname = "#input_67_223"; 
        city = "#input_67_224"; 
        state = "#input_67_225"; 
        zip = "#input_67_226"; 
        phone = "#input_67_227"; 
        alt_phone = "#input_67_228"; 
        npi_num = "#input_67_234"; 
        npi_name = "#input_67_235"; 
        npi_street = "#input_67_236"; 
        npi_state = "#input_67_237"; 
        npi_phone = "#input_67_238"; 
        npi_fax = "#input_67_239"; 
        search = "#choice_67_217"; 
        dr_results = "#choice_67_218"; 
        select_dr = "#input_67_219";
    }
    if($(`${search}_3`).prop("checked") === true) {
        $("#wp_npi_confirmed").html(`
        <span>${$(`${npi_name}`).val()}</span><br />
        <span>${$(`${npi_street}`).val()}</span><br />
        <span>${$(`${npi_state}`).val()}</span><br />
        <span>P: ${$(`${phone}`).val()}</span><br />
        ${$(`${npi_fax}`).val() ? 
            `<span>F:&nbsp;${$(`${npi_fax}`).val()}</span>` 
        : ''}
        `).change();
    }

    $("#wp_npi_search").click(function(){
        //console.log($("#wp_npi_search").attr("name"));
        if(form_id === '63') {
            npi_run();
        } else if(form_id === '67') {
            npi_run();
        }
        else {
            alert('Sorry this form is still in development progress!');
        }
    });

});