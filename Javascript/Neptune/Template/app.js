(function($, w, d) {
	var $appControlsCon, $siteLocaleComponent, $navCon;
	var $appContentCon;

	var CSS_CLASS_HAS_SITE_LOCALE = 'has-site-locale';
	var CSS_CLASS_SELECT_INIT = 'select2-init';

	var DEFAULT_SELECT_OPTIONS = {
		//width: function() {
		//	return parseInt(this.element.width(), 10) + 15;
		//},
		theme: 'vipa',
		minimumResultsForSearch: 10
	};

	function Menu(target, opts) {
		var $root;
		var CSS_OPEN_CLASS = 'mi-open';
		var STORAGE_CONCAT_CHAR = '|';
		var $menuParents;
		var id;

		function saveState() {
			if (typeof localStorage === 'undefined') {
				return;
			}

			var openParentIds = $menuParents.filter('.' + CSS_OPEN_CLASS)
					.map(function () {
						return this.id;
					})
					.get()
					.join(STORAGE_CONCAT_CHAR);

			localStorage.setItem(id, openParentIds);
		}

		function loadState() {
			if (typeof localStorage === 'undefined') {
				return;
			}

			var openParentIds = localStorage.getItem(id);

			if (openParentIds) {
				openParents($(openParentIds.split(STORAGE_CONCAT_CHAR)).map(function() {
					return d.getElementById(this);
				}).get());
			}
		}

		function openParents(parents) {
			$(parents).addClass(CSS_OPEN_CLASS);
			saveState();
		}

		function toggleOpen(el) {
			$(el).toggleClass(CSS_OPEN_CLASS);
			saveState();
		}

		function init() {
			$root = $(target);
			id = $root.attr('id');

			//cache parents
			$menuParents = $root.find('.mi-parent');

			//remove parents with empty children
			$menuParents.find(' > .menu:empty').parent().remove();

			$menuParents.on('click', '.menuitemlabel', function(evt) {
				toggleOpen(this.parentNode);
			});

			loadState();
		}

		init();
	}

	function destroySelectUpdates(context) {
		var $con = $(context || document);

		if (!$con.hasClass(CSS_CLASS_SELECT_INIT)) {
			$con = $con.find('select').filter('.' + CSS_CLASS_SELECT_INIT);
		}

		if ($con.length) {
			$con.removeClass(CSS_CLASS_SELECT_INIT).select2('destroy');
		}
	}

	function initSelectUpdates(context) {
		var $con = $(context || document);

		if (!$con.is('select')) {
			$con = $con.find('select');
		}

		if ($con.length && !$con.closest('tr[data-dnd-source-def]').length) {
			$con
					.select2(DEFAULT_SELECT_OPTIONS)
					.addClass(CSS_CLASS_SELECT_INIT)
					.filter('[data-features="watch"]')
					.on('change', miwt.observerFormSubmit);
		}
	}

	function initControls() {
		//find elements
		$appControlsCon = $('.e-app-controls');
		$siteLocaleComponent = $appControlsCon.find('.site-locale');
		$navCon = $('.l-nav');

		//move site content menu
		$navCon.find('.site-content-menu > .menu > .mi').insertAfter('.primary-nav > .menu > .nav-cms-group');

		//set up menu
		new Menu('.primary-nav');

		//add state information to controls
		if ($siteLocaleComponent.length) {
			$appControlsCon.addClass(CSS_CLASS_HAS_SITE_LOCALE);
		}

		//set up scrollbar on menu
		//need to do this https://github.com/malihu/malihu-custom-scrollbar-plugin/issues/187
		$navCon.mCustomScrollbar({
			scrollInertia: 0,
			mouseWheel: {
				deltaFactor: 1,
				normalizeDelta: true,
				scrollAmount: 100
			}
		});
	}

	function initContent() {
		//find elements
		$appContentCon = $('.e-app-content');

		//set up miwt interactions
		$appContentCon.find('form.miwt-form').each(function() {
			this.submit_options = {
				preProcessNode: function(data) {
					destroySelectUpdates(document.getElementById(data.refid));
					return data.content;
				},
				postProcessNode: function(data) {
					$.each(data, function(idx, d) {
						initSelectUpdates(d.node);
					});
				}
			};

			initSelectUpdates(this);
		});
	}

	$(d).on('vs:init-controls', initControls).on('vs:init-content', initContent);

	$(d).ready(function() {
		//need select 2 to be fixed for programmatic init
		$(this).trigger('vs:init-content');
	});

})(jQuery, window, document);