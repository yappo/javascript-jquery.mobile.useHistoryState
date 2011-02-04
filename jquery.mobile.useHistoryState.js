/*
 * jQuery Mobile using history state
 * Copyright (c) Kazuhiro Osawa
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
/*

=head1 name

implement history state for jQuery Mobile

=head1 EXAMPLE

# in http://example.com/iphone/

    <html data-useHistoryState-pathnamePrefix="/iphone/" data-useHistoryState-pageidPrefix="page-">
      <head>
        <link rel="stylesheet" href="/css/jquery.mobile-1.0a2.min.css" />
        <script src="/js/jquery-1.4.4.min.js"></script>
        <script src="/js/jquery.mobile-1.0a2.min.js"></script>
        <script src="/js/jquery.mobile.useHistoryState.js"></script>
        <script>
$(function(){
  $("#foo").click(function(){
    e.stopPropagation();
    $.mobile.changePageWithHistoryState("page-index");
  });
});
        </script>
      </head>
      <body>

        <div data-role="page" id="page-index">
          <div data-role="header">
            <h1>INDEX PAGE</h1>
          </div>
          <div data-role="content">
              <a href="#page-help">help</a>
          </div>
        </div>

        <div data-role="page" id="page-help">
          <div data-role="header">
            <h1>HELP PAGE</h1>
          </div>
          <div data-role="content">
              help here
          </div>
        </div>

      </body>
    </html>

=cut

 */
(function($) {

	$.mobile.changePageWithHistoryState = function(to, transition, reverse, changeHash, fromHashChange) {
		if (changeHash === undefined) {
			changeHash = true;
		}
		$.mobile.changePage(to, transition, reverse, changeHash, fromHashChange);
	};

$(function() {
	if (!$.support.pushState) {
		return;
	}

	var $html = $("html");
	var pathnamePrefix = $html.data("useHistoryState-pathnamePrefix");
	var pageidPrefix   = $html.data("useHistoryState-pageidPrefix");
	var pathnameRe     = new RegExp("^" + pathnamePrefix);
	var pageidRe       = new RegExp("^" + pageidPrefix);
	
	function pageid2path(pageid) {
		return pageid.replace(/^#/, "").replace(pageidRe, pathnamePrefix);
	}
	function path2pageid(path) {
		var pageid = path.replace(pathnameRe, pageidPrefix);
		if (pageid === pageidPrefix || !pageid.match(pageidRe)) {
			return null;
		}
		return pageid;
	}

	var pageid = path2pageid(location.pathname);
	if (pageid === null) {
		pageid = $.mobile.activePage.attr("id").replace(/^#/, "");
	}
	if (pageid) {
		var pathname = pageid2path(pageid);
		$.mobile.changePage(pageid, "none", false, false);
		history.replaceState(pathname, pathname, pathname);
	}

	$(window).bind( "hashchange", function(e, triggered) {
		if (location.hash === "") {
			return;
		}
		var pathname = pageid2path(location.hash);

		// location.hash -> location.pathname
		history.replaceState(pathname, pathname, pathname);
	});

	$(window).bind( "popstate", function(e) {
		// XXX: force hashchange event disable in jquery.mobile.navigation.js
		var orighashListeningEnabled = $.mobile.hashListeningEnabled;
		$.mobile.hashListeningEnabled = false;

		var pageid = path2pageid(e.originalEvent.state);
		$.mobile.changePage(pageid, undefined, undefined, false, true);

		// XXX: force hashchange event disable in jquery.mobile.navigation.js
		// too tricky...
		setTimeout(function(){
			$.mobile.hashListeningEnabled = orighashListeningEnabled;
		}, 0);
	});
	
});
})(jQuery);
