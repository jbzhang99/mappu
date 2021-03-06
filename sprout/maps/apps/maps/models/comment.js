/**
  *  Mappu : yet another web gis (with social taste).
  *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
  *
  *  Licensed under the LGPL.
*/

/*globals Maps */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Maps.Comment = SC.Record.extend(
/** @scope Maps.Comment.prototype */ {
	
	dateCreated: SC.Record.attr(SC.DateTime),
	text: SC.Record.attr(String),
	social: SC.Record.attr(String),
    username: SC.Record.attr(String),

  	readable: function(k,v) {
  		if (v!=null) {
  			// setting new value
  			if (v.startsWith("At ")) {
  				// remove the date statement
  				var idx=v.indexOf(": ");
  				if (idx!=-1) {
  					v=v.substr(idx+2);
  				}
  			}
  			this.set("text",v);	
  		} else {
  			if (this.get("dateCreated"))
  				return "["+this.get("username")+"] alle "+this.get("dateCreated").toFormattedString('%Y-%m-%d %H:%M:%S')+": "+this.get("text");
            else if(this.get("text")=="")
                return "";
            return "["+this.get("username")+"] poco fa: "+this.get("text");
  		}
  	}.property("text","dateCreated","username").cacheable()
}) ;
