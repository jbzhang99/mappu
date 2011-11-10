/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/
Maps.MainResponder = SC.Responder.create({

    logout: function(){
        Maps.authenticationManager.logout();
    },

    print: function(){
        SC.AlertPane.info("_working_on_it".loc(), "_working_on_it".loc(), "", "OK", this);
    },

    maps_RenderTags: function() {
        Maps.tagsController.gatherTagPoints();
    },

    maps_ReloadTags: function() {
        Maps.tagsController.get("content").refresh();
        Maps.tagsController.hideTagsLayer();
    },

    // called when the user dblclicks an item in list view
    maps_featureSelected: function() {
        var selectedFeature = Maps.featureInfoController.get("selection").firstObject();
        if(!selectedFeature) return;
        var hasSocial=selectedFeature.get("social");
        var selectionIndex = Maps.featureInfoController.indexOf(selectedFeature);
        var view = Maps.mainPage.mainPane.splitview.bottomRightView.resultsView.contentView.itemViewForContentIndex(selectionIndex);

        if(hasSocial) {
            Maps.socialController.set("content", selectedFeature.get("social"));
            Maps.socialCommentsController.findComments();
        }
        // always fetch links
        Maps.linkController.findLinks();

        var pickerPane = SC.PickerPane.design(SC.Animatable,{
            themeName: 'popover',

            transitions: {
                opacity: { duration: .25, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT }
            },
            
            layout: { width: 400, height: 300 },
            contentView: SC.WorkspaceView.extend({
                topToolbar: null,
                bottomToolbar: null,

                contentView:SC.View.design({
                    classNames: 'popover_content_background'.w(),
                    
                    childViews:"tabs".w(),
                    tabs:SC.TabView.extend({
                        layout: {top: 10, left: 5, right: 5, bottom: 5},
                        itemTitleKey: "title",
                        itemValueKey: "tab",
                        items: [
                            {title: "_tags".loc(), tab: ( hasSocial ? "Maps.mainPage.tagsTab" : "Maps.mainPage.nosocialTab" ) },
                            {title: "_comments".loc(), tab: ( hasSocial ? "Maps.mainPage.commentsTab" : "Maps.mainPage.nosocialTab" )},
                            {title: "_links".loc(), tab: "Maps.mainPage.linksTab"}
                        ]
                    })
                })
            })
        }).create();
        // prepare animation
        pickerPane.disableAnimation();
        pickerPane.adjust("opacity", 0).updateStyle();
        // append
        pickerPane.popup(view, SC.PICKER_POINTER);
        pickerPane.enableAnimation();
        // perform animation
        pickerPane.adjust("opacity", 1);
    },

    maps_ClearQueryResults: function() {
        Maps.openLayersController.clearFeatures();
    },

    maps_PerformGeoClose:function() {
        Maps.mainPage.mainPane.splitview.collapseToRight(Maps.mainPage.mainPane.splitview.middleRightView);
    },

    maps_SaveTags: function() {
        var feature = Maps.featureInfoController.get("selection").firstObject();
        Maps.socialController.saveTags(feature);
    },

    maps_AddComment: function() {
        Maps.socialCommentsController.addComment();
    },

    maps_DelComment: function() {
        Maps.socialCommentsController.delComment();
    },

    maps_PerformGeoOperation: function() {
        var op = Maps.featureInfoController.get("operation");
        var geom1 = Maps.featureInfoController.get("feature1geom");
        var geom2 = Maps.featureInfoController.get("feature2geom");
        if (!geom1 && !geom2) {
            SC.AlertPane.warn("_missing_params".loc(), "_select_features".loc() + op, "", "OK", this);
        } else {
            if (!geom2) {
                geom2 = "";
            }
            if (!geom1) {
                geom1 = "";
            }
            SC.Request.postUrl("/mapsocial/jts/" + op.toLowerCase()).notify(this, 'didPerformGeoOperation').send(geom1.toString() + "*" + geom2.toString());
        }
    },

    didPerformGeoOperation: function(response) {
        if (SC.ok(response)) {
            var payload=null;
            if (!response.isJSON())
                payload = SC.$.parseJSON(response.get('body'));
            else
                payload = response.get("body");
            var WKTParser = new OpenLayers.Format.WKT();
            var features = WKTParser.read(payload['geom']);
            Maps.openLayersController.set("measure","Area: "+Math.round(payload['area'])+" m<sup>2</sup>");
            if (features) {
                Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
                Maps.openLayersController.getGeotoolsLayer().addFeatures(features);
            }
        } else {
            SC.AlertPane.warn("_op_failed".loc(), response.get("rawRequest").statusText, 'Error code: ' + response.get("rawRequest").status, "OK", this);
        }
    },

    maps_PerformGeoClear: function() {
        Maps.openLayersController.clearGeoToolsSelection();
        Maps.openLayersController.getGeotoolsLayer().removeAllFeatures();
    },

    maps_LayerSearch: function() {
        Maps.openLayersController.hideLayerPane();
        Maps.openLayersController.layerSearch();
    },

    maps_GoToEditQuery: function() {
        Maps.openLayersController.goToEditQuery();
    },

    layerQueryBack: function() {
        Maps.openLayersController.goToListQuery();
    },

    layerQueryRun: function() {
        var wfs = new OpenLayers.Protocol.HTTP({
            url:"/geoserver/wfs?service=wfs&version=1.0&request=GetFeature&typename=" + Maps.layerQueryController.getTypeName(),
            format: new OpenLayers.Format.GML.v3({})
        });

        // start spinner
        Maps.set("isLoading", YES);

        wfs.read({
            params:{
                "CQL_FILTER":Maps.layerQueryController.getCQLFilter()
            },
            callback: this.didFetchWfsFeatures
        });
    },

    didFetchWfsFeatures : function(response, options) {
        try {
            var gml = new OpenLayers.Format.GML({extractAttributes: true});
            response.features = gml.read(response.priv.responseXML);
            Maps.openLayersController.showInfo(response);
        } catch(e) {
            SC.AlertPane.warn("_op_failed".loc(), response.error, '_no_info_avail'.loc(), "OK", this);
        }
        // stop spinner
        Maps.set("isLoading", NO);
    },

    doRemoveFilter: function() {
        var layer=Maps.openLayersController.get("selection").firstObject();
        if(layer)
                layer.set("cql_filter",null);
    }
});
