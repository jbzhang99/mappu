// ==========================================================================
// Project:   Maps
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Maps = SC.Application.create(
  /** @scope Maps.prototype */ {

  NAMESPACE: 'Maps',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.LayerDataSource'),
  featuresStore: SC.Store.create({commitRecordsAutomatically: YES}).from('Maps.FeatureDataSource'),

  // TODO: Add global constants or singleton objects needed by your app here.
  first_time:YES,

  print: function() {
      Maps_print();
  }
}) ;
