<?php
/*
 *
 * Plugin Name: NNPES Registry NPI Lookup
 * Description: NNPES Registy NPI Integrated with Gravity Forms for Wordpress 
 * Version: 1.0.0
 * Author: Adrian Townsend
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

header("Access-Control-Allow-Origin: *");
add_action('wp_enqueue_scripts', 'wp_npilookup_resource');
function wp_npilookup_resource() {
    wp_enqueue_script('wp-npilookup-script', plugins_url('js/wp-npilookupscript.js', __FILE__), array('jquery'), "1.4.6", true);
    wp_enqueue_style('wp-npilookup-style', plugins_url('css/wp-npilookupstyle.css', __FILE__), array(), "1.0", "all");

    wp_localize_script('wp-npilookup-script', 'wp_ajax_obj', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce('wp_nonce'),
    ));
}

add_action('wp_ajax_wp_npilookup', 'wp_npilookupajax');
add_action('wp_ajax_nopriv_wp_npilookup', 'wp_npilookupajax');
function wp_npilookupajax() {
  //WP - check nonce
  check_ajax_referer( 'wp_nonce' );

	/* 
		Search through NPI registry... https://npiregistry.cms.hhs.gov/api/?version=2.0 
		search params = first_name, last_name, city, state, phone (optional) / all else required | change limit to 25
		- if field added then search 
		- if results under 3 then add wildcard to fname (ex Kevin -> 'Ke*')
  */
  
  $fname = isset($_POST['fname']) ? $_POST['fname'] : '';
  $lname = isset($_POST['lname']) ? $_POST['lname'] : '';
  $city = isset($_POST['city']) ? $_POST['city'] : '';
  $state = isset($_POST['state']) ? $_POST['state'] : '';
  $postal_code = isset($_POST['zip']) ? $_POST['zip'] : '';
  $limit = isset($_POST['limit']) ? $_POST['limit'] : '25';

  $request = wp_remote_get('https://npiregistry.cms.hhs.gov/api/?number=&enumeration_type=NPI-1&taxonomy_description=&first_name='.$fname.'&last_name='.$lname.'&organization_name=&address_purpose=&city='.$city.'&state='.$state.'&postal_code='.$postal_code.'&country_code=&limit='.$limit.'&skip=&version=2.0');

  $body = wp_remote_retrieve_body($request);

  wp_send_json(json_decode($body), true);
  
  //$response = 'https://npiregistry.cms.hhs.gov/api/?version=2.0&enumeration_type=NPI-1&first_name='.$fNAme.'&last_name='.$lNAme.'&city='.$city.'&state='.$state;

  wp_die();
}