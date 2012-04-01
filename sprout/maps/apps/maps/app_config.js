/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

// sc_resource('appconfig.js'); // publish into inline format

var WMSCONFIG = {
    use_cache: true,
    server_path : "/cgi-bin/wms",
    wfs_server_path : "/cgi-bin/wms",
    server_cache_path : "/cgi-bin/wms",
    default_srs: "EPSG:3003",
    // enable use of regexps in link matching
    extended_link_regex: true,
    // attempt to save memory and improve performance
    // might confuse the reordering of layers
    remove_wms_layers_when_not_used: false,
    default_zoom_level: 5
};

var APPCONFIG = {
    title: "Sample",
    print: {
        chrome: "/chrome.html",
        firefox: "/firefox.html",
        other: "/other.html"
    },
    admin_user: "admin",
    advanced_options: "/mapsocial/"
};


