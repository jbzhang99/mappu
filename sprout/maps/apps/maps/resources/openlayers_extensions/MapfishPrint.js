/*
 * Copyright (C) 2008 Camptocamp
 *
 * This file is part of MapFish Client
 *
 * MapFish Client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish Client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MapFish Client.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Request/XMLHttpRequest.js
 */

/**
 * Class: mapfish.PrintProtocol
 * Class to communicate with the print module.
 *
 * This class will automatically pick the layers from the OL map and create the
 * configuration structure accordingly.
 *
 * As we often want a sligtly different styling or minScale/maxScale, an
 * override functionallity is provided that allows to override the OL layers'
 * configuration, this can be used as well if a layer's URL points to a
 * TileCache service to allow the print module to access the WMS service
 * directly.
 *
 * An override structure may look like this:
 * (start code)
 * {
 *   'layerName1': { visibility: false },
 *   'layerName2': {
 *     visibility: false,
 *     300: { visibility: true }
 *   }
 * }
 * (end)
 *
 * In this example, the OL layer named "layerName1" is never printed. The OL
 * layer "layerName2" is visible only when printed at 300DPI.
 */

typeof(mapfish)==="undefined" ? mapfish={} : mapfish;

/*

Usage example:

var printer=new mapfish.PrintProtocol(Maps.openLayersController.getOLMAP(),printConfig);
printer.spec.layout="A4 portrait";
printer.spec.pages=[
        {
            center: [6, 45.5],
            scale: 4000000,
            dpi: 190,
            geodetic: false
        }
    ];
printer.createPDF();

*/

/*
 * Copyright (C) 2009  Camptocamp
 *
 * This file is part of MapFish Client
 *
 * MapFish Client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish Client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MapFish Client.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Namespace: mapfish.Util
 * Utility functions
 */
mapfish.Util = {};

/**
 * APIFunction: sum
 * Return the sum of the elements of an array.
 */
mapfish.Util.sum = function(array) {
    for (var i=0, sum=0; i < array.length; sum += array[i++]);
    return sum;
};

/**
 * APIFunction: max
 * Return the max of the elements of an array.
 */
mapfish.Util.max = function(array) {
    return Math.max.apply({}, array);
};

/**
 * APIFunction: min
 * Return the min of the elements of an array.
 */
mapfish.Util.min = function(array) {
    return Math.min.apply({}, array);
};

/**
 * Function: getIconUrl
 * Builds the URL for a layer icon, based on a WMS GetLegendGraphic request.
 *
 * Parameters:
 * wmsUrl - {String} The URL of a WMS server.
 * options - {Object} The options to set in the request:
 *                    'layer' - the name of the layer for which the icon is requested (required)
 *                    'rule' - the name of a class for this layer (this is set to the layer name if not specified)
 *                    'format' - "image/png" by default
 *                    ...
 *
 * Returns:
 * {String} The URL at which the icon can be found.
 */
mapfish.Util.getIconUrl = function(wmsUrl, options) {
    if (!options.layer) {
        OpenLayers.Console.warn(
            'Missing required layer option in mapfish.Util.getIconUrl');
        return '';
    }
    if (!options.rule) {
        options.rule = options.layer;
    }
    if (wmsUrl.indexOf("?") < 0) {
        //add a ? to the end of the url if it doesn't
        //already contain one
        wmsUrl += "?";
    } else if (wmsUrl.lastIndexOf('&') != (wmsUrl.length - 1)) {
        //if there was already a ? , assure that the parameters
        //are ended with an &, except if the ? was at the last char
        if (wmsUrl.indexOf("?") != (wmsUrl.length - 1)) {
            wmsUrl += "&";
        }
    }
    var options = OpenLayers.Util.extend({
        layer: "",
        rule: "",
        service: "WMS",
        version: "1.1.1",
        request: "GetLegendGraphic",
        format: "image/png",
        width: 16,
        height: 16
    }, options);
    options = OpenLayers.Util.upperCaseObject(options);
    return wmsUrl + OpenLayers.Util.getParameterString(options);
};


/**
 * APIFunction: arrayEqual
 * Compare two arrays containing primitive types.
 *
 * Parameters:
 * a - {Array} 1st to be compared.
 * b - {Array} 2nd to be compared.
 *
 * Returns:
 * {Boolean} True if both given arrays contents are the same (elements value and type).
 */
mapfish.Util.arrayEqual = function(a, b) {
    if(a == null || b == null)
        return false;
    if(typeof(a) != 'object' || typeof(b) != 'object')
        return false;
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; i++) {
        if (typeof(a[i]) != typeof(b[i]))
            return false;
        if (a[i] != b[i])
            return false;
    }
    return true;
};

/**
 * Function: isIE7
 *
 * Returns:
 * {Boolean} True if the browser is Internet Explorer V7
 */
mapfish.Util.isIE7 = function () {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("msie 7") > -1;
};

/**
 * APIFunction: relativeToAbsoluteURL
 *
 * Parameters:
 * source - {String} the source URL
 *
 * Returns:
 * {String} An absolute URL, null is returned if the function
 *     couldn't do the conversion because there are
 *     occurrences of "/../" in the pathname that couldn't
 *     be deal with.
 */
mapfish.Util.relativeToAbsoluteURL = function(source, loc) {
    loc = loc || location;

    var h, p, re;

    if (/^\w+:/.test(source) || !source) {
        return source;
    }

    h = loc.protocol + "//" + loc.host;

    // if source starts with a slash, append source to
    // h and return that
    if (source.indexOf("/") == 0) {
        return h + source;
    }

    // get pathname up to the last slash, and remove
    // that slash
    p = loc.pathname.replace(/\/[^\/]*$/, '');

    // append source to p
    p = p + "/" + source;

    // replace every occurence of "/foo/../" by "/"
    re = /\/[^\/]+\/\.\.\//;
    while (p.match(re) !== null) {
        p = p.replace(re, '/');
    }

    // if there are occurrences of "/../" we couldn't
    // deal with, returns null
    if (p.indexOf("/../") > -1) {
        return null;
    }

    // replace every occurence of "/./" by "/"
    re = /\/\.\//;
    while (p.match(re) !== null) {
        p = p.replace(re, '/');
    }

    return  h + p;
};

/**
 * Function: fixArray
 *
 * In some fields, OpenLayers allows to use a coma separated string instead
 * of an array. This method make sure we end up with an array.
 *
 * Parameters:
 * subs - {String/Array}
 *
 * Returns:
 * {Array}
 */
mapfish.Util.fixArray = function(subs) {
    if (subs == '' || subs == null) {
        return [];
    } else if (subs instanceof Array) {
        return subs;
    } else {
        return subs.split(',');
    }
};

/**
 * Function formatURL
 * If mapfish.PROXY_HOST is defined format the passed URL so that
 * the resource this URL references is accessed through the
 * http-proxy script mapfish.PROXY_HOST references.
 *
 * Parameters:
 * url - {String} The URL to format.
 *
 * Returns:
 * {String} The formatted URL string.
 */
mapfish.Util.formatURL = function(url) {
    var proxy = mapfish.PROXY_HOST;
    if(proxy && (url.indexOf("http") == 0)) {
        var str = url;
        // get protocol from URL
        var protocol = str.match(/https?:\/\//)[0].split(':')[0];
        str = str.slice((protocol + '://').length);
        // get path from URL
        var path = undefined;
        var pathSeparatorIndex = str.indexOf('/');
        if (pathSeparatorIndex != -1) {
            path = str.substring(pathSeparatorIndex);
            str = str.slice(0, pathSeparatorIndex);
        }
        // get host and port from URL
        var host_port = str.split(":");
        var host = host_port[0];
        var port = host_port.length > 1 ? host_port[1] : undefined;
        // build URL
        url = protocol + ',' + host;
        url += (port == undefined ? '' : ',' + port);
        url += (path == undefined ? '' : path);
        if(proxy.lastIndexOf('/') != proxy.length - 1) {
            url = '/' + url;
        }
        url = proxy + url;
    }
    return url;
};

mapfish.PrintProtocol = OpenLayers.Class({
    /**
     * APIProperty: config
     * {String} the configuration as returned by the MapPrinterServlet.
     */
    config: null,

    /**
     * APIProperty: spec
     * {Object} The complete spec to send to the servlet. You can use it to add
     * custom parameters.
     */
    spec: null,

    /**
     * APIProperty: params
     * {Object} Additional params to send in the print service Ajax calls. Can
     *          be used to set the "locale" parameter.
     */
    params: null,

    /**
     * Property: hasOverview
     * {Boolean} True if overview is specified in some overrides.
     */
    hasOverview: false,

    /**
     * APIProperty: geodetic
     * {Boolean} True if the projection is geodetic, for a correct scale
     * calculation.
     */
    geodetic: false,

    /**
     * Constructor: mapfish.PrintProtocol
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The OL MAP.
     * config - {Object} the configuration as returned by the MapPrinterServlet.
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * dpi - {Integer} the DPI resolution
     * params - {Object} additional params to send in the Ajax calls
     */
    initialize: function(map, config, overrides, dpi, params, geodetic) {
        this.config = config;
        this.spec = {pages: []};
        overrides = this.fixOverrides(overrides, map);
        this.geodetic = (geodetic != undefined) ? geodetic : this.geodetic;
        this.addMapParams(overrides, map, dpi);
        this.addOverviewMapParams(overrides, map, dpi);
        this.params = params;
    },

    /**
     * APIMethod: getAllInOneUrl
     *
     * Creates the URL string for generating a PDF using the print module. Using
     * the direct method.
     *
     * WARNING: this method has problems with accents and requests with lots of
     *          pages. But it has the advantage to work without proxy.
     *
     * Returns:
     * {String} The URL
     */
    getAllInOneUrl: function() {
        var json = new OpenLayers.Format.JSON();
        var result = this.config.printURL + "?spec=" +
                     json.write(this.encodeForURL(this.spec));
        if (this.params) {
            result += "&" + OpenLayers.Util.getParameterString(this.params);
        }
        return result;
    },

    /**
     * APIMethod: createPDF
     *
     * Uses AJAX to create the PDF on the server and then gets it from the
     * server. If it doesn't work (different URL and OpenLayers.ProxyHost not
     * set), try the GET direct method.
     *
     * Parameters:
     * success - {Function} The function to call in case of success.
     * popup - {Function} The function to call in case of success, but when
     *                    unable to load automatically the document.
     * failure - {Function} The function to call in case of failure. Gets the
     *                      request object in parameter. If getURL is defined,
     *                      the popup where blocked and the PDF can still be
     *                      recovered using this URL.
     * context - {Object} The context to use to call the success of failure
     *                    method.
     */
    createPDF: function(success, popup, failure, context) {
        var specTxt = new OpenLayers.Format.JSON().write(this.spec);
        OpenLayers.Console.info(specTxt);

        try {
            //The charset seems always to be UTF-8, regardless of the page's
            var charset = "UTF-8";
            /*+document.characterSet*/

            var params = OpenLayers.Util.applyDefaults({
                url: this.config.createURL
            }, this.params);

            OpenLayers.Request.POST({
                url: this.config.createURL,
                //data: specTxt,
                params: {spec:specTxt},
                headers: {
                    'CONTENT-TYPE': "application/x-www-form-urlencoded"
                },
                callback: function(request) {
                    if (request.status >= 200 && request.status < 300) {
                        var json = new OpenLayers.Format.JSON();
                        var answer = json.read(request.responseText);
                        if (answer && answer.getURL) {
                            this.openPdf(answer, success, popup, context);
                        } else {
                            failure.call(context, request);
                        }
                    } else {
                        failure.call(context, request);
                    }
                },
                scope: this
            });
        } catch (err) {
            OpenLayers.Console.warn(
                    "Cannot request the print service by AJAX. You must set " +
                    "the 'OpenLayers.ProxyHost' variable. Fallback to GET method");
            //try the other method
            window.open(this.getAllInOneUrl());
            success.call(context, err);
        }
    },

    /**
     * Method: openPdf
     *
     * Work around the browsers security "features" and open the given PDF
     * document.
     *
     * Parameters:
     * answer - {Object} The answer for the AJAX call to the print service.
     * success - {Function} The function to call in case of success.
     * popup - {Function} The function to call in case of success, but when
     *                    unable to load automatically the document.
     * context - {Object} The context to use to call the success of failure
     *                    method
     */
    openPdf: function(answer, success, popup, context) {
        OpenLayers.Console.info(answer.getURL);
        if (Ext.isIE || Ext.isOpera) {
            // OK, my friend IE on XP SP2 (or higher) tends to have this:
            // http://support.microsoft.com/kb/883255

            // For Opera, it tends to not respect the Content-disposition
            // header and overwrite the current tab with the PDF

            // I found no way to detect it, so we put a nice popup.
            popup.call(context, answer);

        } else {
            // FF2, FF3 or Safari: easier to deal with.
            // This won't erase the current window since the URL returns with
            // a "Content-disposition: attachment" header and thus will propose
            // to save or open using the PDF reader.
            window.location = answer.getURL;
            success.call(context);
        }
    },

    /**
     * Method: fixOverrides
     *
     * In the overrides, if one of the layers has the overview attribute set,
     * set this attribute to false on all the layers where it's not set.
     *
     * Parameters:
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * map - {<OpenLayers.Map>} The OL MAP.
     *
     * Returns:
     * {object} The fixed overrides structure.
     */
    fixOverrides: function(overrides, map) {
        overrides = OpenLayers.Util.extend({}, overrides);
        var hasOverview = false;
        var name;
        for (var i = 0; i < map.layers.length; ++i) {
            var olLayer = map.layers[i];
            name = olLayer.name;
            if (!overrides[name]) {
                overrides[name] = {};
            } else if (overrides[name].overview) {
                hasOverview = true;
            }
        }

        if (hasOverview) {
            for (name in overrides) {
                var cur = overrides[name];
                if (!cur.overview) {
                    cur.overview = false;
                }
            }
        }

        this.hasOverview = hasOverview;

        return overrides;
    },

    /**
     * Method: addMapParams
     *
     * Takes an OpenLayers Map and build the configuration needed by
     * the print module.
     *
     * Parameters:
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * map - {<OpenLayers.Map>} The OL MAP.
     * dpi - {Integer} the DPI resolution.
     */
    addMapParams: function(overrides, map, dpi) {
        var spec = this.spec;
        spec.dpi = dpi;
        spec.units = map.baseLayer.units;
        spec.srs = map.baseLayer.projection.getCode();
        spec.geodetic = this.geodetic;
        var layers = spec.layers = [];
        this.fillLayers(layers, map.layers, overrides, dpi);
    },

    /**
     * Method: addOverviewMapParams
     *
     * Look for an OverviewMap control in the Map and build the overviewLayers
     * part of the spec needed by the print module. It's done only if there is
     * no overview overrides
     *
     * Parameters:
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * map - {<OpenLayers.Map>} The OL MAP.
     * dpi - {Integer} the DPI resolution.
     */
    addOverviewMapParams: function(overrides, map, dpi) {
        if (!this.hasOverview) {
            var overviewControls = map.getControlsByClass('OpenLayers.Control.OverviewMap');
            if (overviewControls.length > 0) {
                var spec = this.spec;
                var layers = spec.overviewLayers = [];
                this.fillLayers(layers, overviewControls[0].layers, overrides, dpi);
            }
        }
    },

    /**
     * Method: fillLayers
     *
     * Add the layer structure to the given chunk of spec.
     *
     * Parameters:
     * layers - {Array} the target spec chunk.
     * olLayers - {Array(<OpenLayers.Layer>)} The OpenLayers layers.
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * dpi - {Integer} the DPI resolution.
     */
    fillLayers: function(layers, olLayers, overrides, dpi) {
        for (var i = 0; i < olLayers.length; ++i) {
            var olLayer = olLayers[i];
            var layerOverrides = OpenLayers.Util.extend({}, overrides[olLayer.name]);

            //allows to have some attributes overriden in fct of the resolution
            OpenLayers.Util.extend(layerOverrides, layerOverrides[dpi]);

            if ((olLayer.getVisibility() && layerOverrides.visibility !== false) ||
                layerOverrides.visibility === true) {
                var type = olLayer.CLASS_NAME;
                var handler = mapfish.PrintProtocol.SUPPORTED_TYPES[type];
                if (handler) {
                    var layer = handler.call(this, olLayer);
                    if (layer) {
                        this.applyOverrides(layer, layerOverrides);

                        if (olLayer.isBaseLayer) {
                            // base layers are always first
                            layers.unshift(layer);
                        } else {
                            layers.push(layer);
                        }
                    }
                } else if (!handler) {
                    OpenLayers.Console.error(
                            "Don't know how to print a layer of type " + type +
                            " (" + olLayer.name + ")");
                }
            }
        }
    },

    /**
     * Method: applyOverrides
     *
     * Change the layer config according to the overrides.
     *
     * Parameters:
     * layer - {<Object>} A layer's print config
     * overrides - {Object} the map that specify the print module overrides for
     *                      one layer.
     */
    applyOverrides: function(layer, overrides) {
        for (var key in overrides) {
            if (isNaN(parseInt(key))) {
                var value = overrides[key];
                if (key == 'layers' || key == 'styles') {
                    value = mapfish.Util.fixArray(value);
                }
                if (key == "visibility") {
                    //not sent
                } else if (layer[key] != null || key == "overview") {
                    layer[key] = value;
                } else {
                    layer.customParams[key] = value;
                }
            }
        }
    },

    /**
     * Method: convertLayer
     *
     * Handles the common parameters of all supported layer types.
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertLayer: function(olLayer) {
        var url = olLayer.url;
        if (url instanceof Array) {
            url = url[0];
        }
        return {
            baseURL: mapfish.Util.relativeToAbsoluteURL(url),
            opacity: (olLayer.opacity != null) ? olLayer.opacity : 1.0,
            singleTile: olLayer.singleTile,
            customParams: {}
        };
    },

    /**
     * Method: convertWMSLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.WMS>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'WMS'
     *   baseURL: {String}
     *   layers: [{String}]
     *   styles: [{String}]
     *   format: {String}
     *   opacity: {Float}
     *   singleTile: {boolean}
     *   customParams: {
     *     {String}: {String}
     *   }
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.WMS>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertWMSLayer: function(olLayer) {
        var layer = OpenLayers.Util.extend(this.convertLayer(olLayer),
        {
            type: 'WMS',
            layers: mapfish.Util.fixArray(olLayer.params.LAYERS),
            format: olLayer.params.FORMAT || olLayer.DEFAULT_PARAMS.format,
            styles: mapfish.Util.fixArray(olLayer.params.STYLES ||
                                          olLayer.DEFAULT_PARAMS.styles)
        });
        for (var paramName in olLayer.params) {
            var paramNameLow = paramName.toLowerCase();
            if (olLayer.DEFAULT_PARAMS[paramNameLow] == null &&
                paramNameLow != 'layers' &&
                paramNameLow != 'width' &&
                paramNameLow != 'height' &&
                paramNameLow != 'srs') {
                layer.customParams[paramName] = olLayer.params[paramName];
            }
        }
        return layer;
    },

    /**
     * Method: convertMapServerLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.MapServer>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'Mapserver'
     *   baseURL: {String}
     *   layers: [{String}]
     *   styles: [{String}]
     *   format: {String}
     *   opacity: {Float}
     *   singleTile: {boolean}
     *   customParams: {
     *     {String}: {String}
     *   }
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.MapServer>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertMapServerLayer: function(olLayer) {
        var layer = OpenLayers.Util.extend(this.convertLayer(olLayer),
        {
            type: 'MapServer',
            layers: mapfish.Util.fixArray(olLayer.params.LAYERS || olLayer.params.layers),
            format: olLayer.params.FORMAT || olLayer.params.format || olLayer.DEFAULT_PARAMS.format
        });
        for (var paramName in olLayer.params) {
            var paramNameLow = paramName.toLowerCase();
            if (olLayer.DEFAULT_PARAMS[paramNameLow] == null &&
                paramNameLow != 'layers' &&
                paramNameLow != 'format' &&
                paramNameLow != 'width' &&
                paramNameLow != 'height' &&
                paramNameLow != 'srs') {
                layer.customParams[paramName] = olLayer.params[paramName];
            }
        }
        return layer;
    },

    /**
     * Method: convertTileCacheLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.TileCache>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'TileCache'
     *   baseURL: {String}
     *   layer: {String}
     *   opacity: {Float}
     *   maxExtent: [minx, miny]
     *   tileSize: [width, height]
     *   extension: {String}
     *   resolutions: [{Float}]
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.TileCache>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertTileCacheLayer: function(olLayer) {
        return OpenLayers.Util.extend(this.convertLayer(olLayer), {
            type: 'TileCache',
            layer: olLayer.layername,
            maxExtent: olLayer.maxExtent.toArray(),
            tileSize: [olLayer.tileSize.w, olLayer.tileSize.h],
            extension: olLayer.extension,
            resolutions: olLayer.serverResolutions || olLayer.resolutions
        });
    },

    /**
     * Method: convertOSMLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.OSM>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'OSM'
     *   baseURL: {String}
     *   layers: [{String}]
     *   styles: [{String}]
     *   format: {String}
     *   opacity: {Float}
     *   singleTile: {boolean}
     *   customParams: {
     *     {String}: {String}
     *   }
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.OSM>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertOSMLayer: function(olLayer) {
        var layerInfo = this.convertTileCacheLayer(olLayer);
        layerInfo.type = 'Osm';
        layerInfo.baseURL = layerInfo.baseURL.substr(0, layerInfo.baseURL.indexOf("$"));
        layerInfo.extension = "png";
        return layerInfo;
    },

    /**
     * Method: convertGoogleLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.Google>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'Google'
     *   baseURL: 'http://maps.google.com/maps/api/staticmap'
     *   extension: 'png'
     *   format: {String}
     *   format: 'png32'
     *   sensor: 'false',
     *   maptype: {String}
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.Google>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertGoogleLayer: function(olLayer) {
        var layerInfo = this.convertTileCacheLayer(olLayer);
        layerInfo.type = 'Google';
        layerInfo.baseURL = 'http://maps.google.com/maps/api/staticmap';
        layerInfo.extension = "png";
        layerInfo.format = 'png32';
        layerInfo.sensor = 'false';
        if (olLayer.type) {
            var layerName = ( typeof(olLayer.type)=="string" ? olLayer.type : olLayer.type.getName() );
            if (layerName == 'Satellite') {
               layerInfo.maptype = 'satellite';
            } else if (layerName == 'Hybrid') {
                layerInfo.maptype = 'hybrid';
            } else if (layerName == 'Terrain') {
                layerInfo.maptype = 'terrain';
            } else {
                layerInfo.maptype = 'roadmap';
            }
        } else {
            layerInfo.maptype = 'roadmap';
        }
        return layerInfo;
    },

    /**
     * Method: convertTMSLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.TMS>} layer.
     * The structure expected from the print module is:
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.TMS>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertTMSLayer: function(olLayer) {
        var layerInfo = this.convertTileCacheLayer(olLayer);
        layerInfo.type = 'TMS';
        layerInfo.baseURL = olLayer.url;
        layerInfo.format = olLayer.type;
        return layerInfo;
    },

    /**
     * Method: convertImageLayer
     *
     * Builds the layer configuration from an {<OpenLayers.Layer.TileCache>} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     * type: 'Image'
     * baseURL: {String}
     * opacity: {Float}
     * extent: [minx, miny, maxX, maxY]
     * pixelSize: [width, height]
     * name: {String}
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {<OpenLayers.Layer.Image>} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertImageLayer: function(olLayer) {
        var url = olLayer.getURL(olLayer.extent);
        return {
            type: 'Image',
            baseURL: mapfish.Util.relativeToAbsoluteURL(url),
            opacity: (olLayer.opacity != null) ? olLayer.opacity : 1.0,
            extent: olLayer.extent.toArray(),
            pixelSize: [olLayer.size.w, olLayer.size.h],
            name: olLayer.name
        };
    },

    /**
     * Method: convertVectorLayer
     *
     * Builds the layer configuration from an {OpenLayers.Layer.Vector} layer.
     * The structure expected from the print module is:
     * (start code)
     * {
     *   type: 'Vector'
     *   styles: {Object}
     *   styleProperty: {String}
     *   geoJson: {Object}
     *   opacity: {Float}
     *   name: {String}
     * }
     * (end)
     *
     * Parameters:
     * olLayer - {OpenLayers.Layer.Vector} The OL layer.
     *
     * Returns:
     * {Object} The config for this layer
     */
    convertVectorLayer: function(olLayer) {
        var olFeatures = olLayer.features;
        var features = [];
        var styles = {
        };
        var formatter = new OpenLayers.Format.GeoJSON();
        var nextId = 1;
        for (var i = 0; i < olFeatures.length; ++i) {
            var feature = olFeatures[i];
            var style = feature.style || olLayer.style ||
                        olLayer.styleMap.createSymbolizer(feature, feature.renderIntent);
            var styleName;
            if (style._printId) {
                //this style is already known
                styleName = style._printId;
            } else {
                //new style
                style._printId = styleName = nextId++;
                styles[styleName] = style;

                //Make the URLs absolute
                if (style.externalGraphic) {
                    style.externalGraphic = mapfish.Util.relativeToAbsoluteURL(style.externalGraphic);
                }
            }
            var featureGeoJson = formatter.extract.feature.call(formatter, feature);

            //OL just copy the reference to the properties. Since we don't want
            //to modify the original dictionary, we make a copy.
            featureGeoJson.properties = OpenLayers.Util.extend({
                _style: styleName
            }, featureGeoJson.properties);
            for (var cur in featureGeoJson.properties) {
                var curVal = featureGeoJson.properties[cur];
                if (curVal instanceof Object && !(curVal instanceof String)) {
                    //OL.Format.Json goes into an infinite recursion if we have too
                    //complex objects. So we remove them.
                    delete featureGeoJson.properties[cur];
                }
            }

            features.push(featureGeoJson);
        }
        for (var key in styles) {
            delete styles[key]._printId;
        }

        var geoJson = {
            "type": "FeatureCollection",
            "features": features
        };
        return OpenLayers.Util.extend(this.convertLayer(olLayer), {
            type: 'Vector',
            styles: styles,
            styleProperty: '_style',
            geoJson: geoJson,
            name: olLayer.name,
            opacity:  (olLayer.opacity != null) ? olLayer.opacity : 1.0
        });
    },

    /**
     * Method: encodeForURL
     *
     * Takes a JSON structure and encode it so it can be added to an HTTP GET
     * URL. Does a better job with the accents than encodeURIComponent().
     * @param cur
     */
    encodeForURL: function(cur) {
        if (cur == null) return null;
        var type = typeof cur;
        Ext.type(cur);
        if (type == 'string') {
            return escape(cur.replace(/[\n]/g, "\\n"));
        } else if (type == 'object' && cur.constructor == Array) {
            var array = [];
            for (var i = 0; i < cur.length; ++i) {
                var val = this.encodeForURL(cur[i]);
                if (val != null) array.push(val);
            }
            return array;
        } else if (type == 'object' && cur.CLASS_NAME &&
                   cur.CLASS_NAME == 'OpenLayers.Feature.Vector') {
            return new OpenLayers.Format.WKT().write(cur);
        } else if (type == 'object') {
            var hash = {};
            for (var j in cur) {
                var val2 = this.encodeForURL(cur[j]);
                if (val2 != null) hash[j] = val2;
            }
            return hash;
        } else {
            return cur;
        }
    },

    CLASS_NAME: "mapfish.PrintProtocol"
});


//TODO 2.0: pass a config object instead of those 5 params
/**
 * APIFunction: getConfiguration
 *
 * Does an AJAX call to get the print configuration from the server.
 *
 * Parameters:
 * url - {String} the URL to access .../config.json
 * success - {Function} the function that will be called with the
 *           configuration object when/if its received.
 * failure - {Function} the function that is called in case of error.
 * context - {Object} The context to use when calling the callbacks.
 * params -  {Object} additional params to send in the Ajax calls
 */
mapfish.PrintProtocol.getConfiguration = function(url, success,
                                                  failure, context, params) {
    try {
        params = OpenLayers.Util.extend(params, { url: url });

        OpenLayers.Request.GET({
            url: url,
            params: params,
            callback: function(request) {
                if (request.status >= 200 && request.status < 300) {
                    var json = new OpenLayers.Format.JSON();
                    var answer = json.read(request.responseText);
                    if (answer) {
                        success.call(context, answer);
                    } else {
                        failure.call(context, request);
                    }
                } else {
                    failure.call(context, request);
                }
            }
        });
    } catch(err) {
        failure.call(context, err);
    }
};


mapfish.PrintProtocol.IGNORED = function() {
    return null;
};

mapfish.PrintProtocol.SUPPORTED_TYPES = {
    'OpenLayers.Layer': mapfish.PrintProtocol.IGNORED,
    'OpenLayers.Layer.WMS': mapfish.PrintProtocol.prototype.convertWMSLayer,
    'OpenLayers.Layer.WMS.Untiled': mapfish.PrintProtocol.prototype.convertWMSLayer,
    'OpenLayers.Layer.TileCache': mapfish.PrintProtocol.prototype.convertTileCacheLayer,
    'OpenLayers.Layer.OSM': mapfish.PrintProtocol.prototype.convertOSMLayer,
    'OpenLayers.Layer.TMS': mapfish.PrintProtocol.prototype.convertTMSLayer,
    'OpenLayers.Layer.Vector': mapfish.PrintProtocol.prototype.convertVectorLayer,
    'OpenLayers.Layer.Vector.RootContainer': mapfish.PrintProtocol.prototype.convertVectorLayer,
    'OpenLayers.Layer.GML': mapfish.PrintProtocol.prototype.convertVectorLayer,
    'OpenLayers.Layer.PointTrack': mapfish.PrintProtocol.prototype.convertVectorLayer,
    'OpenLayers.Layer.MapServer': mapfish.PrintProtocol.prototype.convertMapServerLayer,
    'OpenLayers.Layer.MapServer.Untiled': mapfish.PrintProtocol.prototype.convertMapServerLayer,
    'OpenLayers.Layer.Image': mapfish.PrintProtocol.prototype.convertImageLayer,
    //'OpenLayers.Layer.Google': mapfish.PrintProtocol.prototype.convertGoogleLayer
};