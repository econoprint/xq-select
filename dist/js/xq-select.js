/**
 * Configures the given element as a search field, performing the given callbacks on search & clear.
 *
 * @returns {jQuery}
 */
;(function($) {

  $.searchField = function(el, options) {

    var defaults = {
      minCharacter: 3,
      deferRequestBy: 500,
      search: function(search) {},
      clear: function() {}
    };

    var keys = {
      ESC:    27,
      TAB:    9,
      RETURN: 13,
      LEFT:   37,
      UP:     38,
      RIGHT:  39,
      DOWN:   40
    };

    var sf     = this;
    var $input = $(el);

    sf.settings = {};

    sf.init = function() {

      sf.settings = $.extend({}, defaults, options);
      sf.currentValue = $input.val();
      sf.onChangeInterval = {};

      // Remove autocomplete attribute to prevent native suggestions
      // Prevent iOS/Android/Win10 annoyances that alter search terms
      var attr = { autocomplete: 'off', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off' };
      $input.attr(attr);

      // React to Input on the Input
      $input
          .on('keyup', function (e) { sf.onKeyUp(e); })
          .on('keydown', function (e) { sf.onKeyDown(e); })
          .on('blur', function () { if( sf.currentValue !== $input.val() ) {  sf.doCallback(); } })
          .on('change', function () { if( sf.currentValue !== $input.val() ) {  sf.doCallback(); } })
      ;
    };

    sf.onKeyDown = function(e) {
      var keyPressed = e.which;

      switch (keyPressed) {
        case keys.ESC:
          $input.val('').trigger('change');
          return;
        case keys.TAB:
          if( sf.currentValue !== $input.val() ) {  sf.doCallback(); }
          return;
        case keys.RETURN:
          if( sf.currentValue !== $input.val() ) {  sf.doCallback(); }
          break;
        default:
          return;
      }

      // Cancel event if function did not return:
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    /**
     * Called when a key is released while the search box is in focus.
     *
     * @param e       The event that triggered this.
     */
    sf.onKeyUp = function(e) {
      var keyPressed = e.which;

      // We don't want to do anything for special keys
      if(sf.isSpecialKey(keyPressed)) { return; }

      clearInterval(sf.onChangeInterval);

      // If any other key, perform the lookup
      if (sf.currentValue !== $input.val()) {
        if (sf.settings.deferRequestBy > 0) {
          // Defer lookup in case when value changes very quickly:
          sf.onChangeInterval = setInterval(function () {
            sf.doCallback();
          }, sf.settings.deferRequestBy);
        } else {
          sf.doCallback();
        }
      }
    };

    sf.isSpecialKey = function(keyPressed) {
      var retval = false;
      $.each( keys, function( key, value ) {
        retval = retval || (value === keyPressed);
      });

      return retval;
    };

    sf.doCallback = function() {
      clearInterval(sf.onChangeInterval);
      sf.currentValue = $input.val();
      if(sf.currentValue.length >= sf.settings.minCharacter) {
        clearInterval(sf.onChangeInterval);
        sf.settings.search(sf.currentValue);

      } else if(sf.currentValue.length === 0) {
        sf.settings.clear();
      }
    };

    sf.init();

  };

  /**
   * @param   {object} options
   * @returns {jQuery}
   */
  $.fn.searchField = function(options) {
    return this.each(function() {
      if (undefined === $(this).data('search-field')) {
        var sf = new $.searchField(this, options);
        $(this).data('search-field', sf);
      }
    });
  }
})(jQuery);

/**
 * Searches the given selector for the given text value, then performs the given callback.
 *
 * @returns {jQuery}
 */
jQuery.fn.extend( {
  domSearch: function ( sel, value, callback ) {
    var ds = this;

    ds.value    = value;
    ds.settings = { minCharacter: 2 };

    ds.hasSearch = function(elem) {
      var retval = false;
      $(elem).contents().each(function() {
        var text = ds.getText(this);
        if(text && text.indexOf(ds.value.toLowerCase()) >= 0) {
          retval = true;
        }
      });

      return retval;
    };

    ds.getText = function(elem) {
      var text = (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase();
      return (text.length >= ds.settings.minCharacter) ? text : null;
    };

    $(sel).each(function() {
      callback(this,ds.hasSearch(this));
    });
  }
} );
/**
 * xqSelect v3.2 (https://github.com/exactquery/xq-select)
 * @author  AMJones [am@jonesiscoding.com]
 * @licence MIT (https://github.com/exactquery/xq-select/blob/master/LICENSE)
 */
;(function($) {

  $.xqselect = function(el, options) {
    var defaults = {
      api: ['mobile','filter'],
      cls: {
        wrapper:  'xq-select-wrapper',
        dropdown: 'dropdown-menu',
        toggle:   'dropdown-toggle',
        option:   'xq-select-item'
      },
      attr: {
        dropdown: { 'role': 'menu' },
        toggle:   { 'type': 'button', 'data-toggle': 'dropdown', 'aria-haspopup': 'true', 'aria-expanded': 'false'}
      },
      fauxOptionDefault:  '--',
      mobile: false
    };

    var plugin = this;

    plugin.settings = {};
    plugin.sel = {};

    var init = function() {
      /** @type jQuery */
      plugin.$el      = $( el );
      plugin.settings = $.extend( {}, defaults, options );

      $.each(plugin.settings.api, function(k,v) { var data = plugin.$el.data(v); plugin.settings[v] = data || plugin.settings[v] || null; });
      $.each(plugin.settings.cls, function(key,val) { plugin.sel[key] = '.' + val; });

      var use = (plugin.$el.attr('data-native') !== 'true') &&
          !(plugin.$el.prop('disabled') || plugin.$el.prop('readonly')) &&
          (!isMobile() || plugin.$el.attr('data-mobile') === 'true')
      ;

      if (use) {
        render();
        plugin.$el.on('xq.select.refresh', function(e) { render(); });
      }
    };

    /**
     * Called when an item in the faux select is clicked on.
     *
     * @param obj
     */
    plugin.onClick = function(obj) {
      var $obj = $( obj );
      var $target = $($obj.attr( 'data-target' ));
      var $dropdown = $obj.parents( plugin.sel.dropdown );
      if(!$obj.hasClass('disabled')) {
        $target.val($obj.attr('data-value'));
        $dropdown.find(plugin.sel.option).removeClass('selected');
        $obj.addClass('selected');
        $target.trigger('change');
      }
      $dropdown.prev( plugin.sel.toggle ).focus();
    };

    /**
     * Called when a key is pressed while a faux select option is in focus.
     *
     * @param e       The event that triggered this.
     * @param obj     The faux select option (li > a).
     */
    plugin.onKeyDown = function(e,obj) {
      if(e.which === 13) {
        e.preventDefault();
        $( obj ).click();
      }
    };

    /**
     * Called when a faux select is opened.
     * @source Zoltán Tamási
     * @param e
     * @param obj
     */
    plugin.onOpen = function(e, obj) {
      /** @type jQuery */
      var $txqs = $(e.target);
      /** @type jQuery */
      var $window = $(window);
      var $ul = $txqs.children(plugin.sel.dropdown);
      var $button = $txqs.children(plugin.sel.toggle);
      var ulOffset = $ul.offset() || 0;
      var spaceUp = (ulOffset.top - $button.height() - $ul.height()) - $window.scrollTop();
      var spaceDown = $window.scrollTop() + $window.height() - (ulOffset.top + $ul.height());
      if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown)) {
        $txqs.addClass('dropup');
      }
      $( obj ).find(plugin.sel.option + '.selected' ).focus();
    };

    /**
     * Closes the dropdown for the given object. Called when the TAB key is pressed with a faux select in focus.
     * This is used instead of the dropdown('toggle') method because that seems to mess with other events.
     *
     * @param obj The faux select object (ul)
     */
    plugin.closeDropDown = function(obj) {
      $( obj ).parent( plugin.sel.wrapper ).removeClass( 'open' );
      $( obj ).prev( plugin.sel.toggle ).attr( 'aria-expanded', false );
    };

    var render = function() {
      var $wrapper = createWrapper();
      $wrapper
          .append(
              $('<button>&nbsp;</button>')
                  .attr($.extend({}, plugin.settings.attr.toggle, {'tabindex': plugin.$el.attr('tabindex') || 0 }))
                  .addClass(plugin.settings.cls.toggle)
          )
          .append(
              addOptions( createDropdown() )
          )
      ;
    };

    var createDropdown = function () {
      var $dd = $( '<ul></ul>' )
          .attr( plugin.settings.attr.dropdown )
          .addClass( plugin.settings.cls.dropdown )
      ;

      if(plugin.settings.filter) {
        var $sb = $('<input type="text" class="xq-filter" />');
        $sb.searchField({
          search: function(q) {
            $.fn.domSearch($dd.find('li'),q,function(el,has) {
              $(el).toggleClass('xq-filtered', !has);
            })
          },
          clear: function() {
            $dd.find( 'li' ).removeClass( 'xq-filtered' );
          }
        });

        $sb.appendTo( '<li></li>' ).appendTo( $dd );
      }

      return $dd;
    };

    var addOptions = function($dropdown) {
      var target = '#' + getElId();
      plugin.$el.children().each( function () {
        /** @type jQuery */
        var $opt = $(this);
        if($opt.prop('tagName') === 'OPTION') {
          $dropdown.append( createOption( $opt, target ) );
        } else if($opt.prop('tagName') === 'OPTGROUP') {
          $dropdown.append( createOptGroup( $opt ) );
          $opt.children().each(function() {
            $dropdown.append( createOption( $(this), target) );
          });
        }
      } );
      $dropdown.find('a').eq(plugin.$el.prop('selectedIndex')).addClass('selected');

      return $dropdown;
    };

    /**
     * Creates an LI to match the given HTML select option.
     *
     * @param $optObj               The option from which to create the faux option.
     * @param target                The ID of the faux select dropdown.
     * @returns {*|HTMLElement}     The faux option as a list item with an anchor.
     */
    var createOption = function($optObj, target) {
      var index = $optObj.index(target + ' option');
      var $ddLink = $( '<a tabindex="' + index + '"></a>' );
      var css = ($optObj.attr('disabled')) ? 'xq-select-item disabled' : 'xq-select-item';
      $ddLink.html( getOptionText( $optObj ) );
      $ddLink
          .attr( 'data-value', $optObj.val() )
          .attr( 'data-target', target )
          .attr( 'data-index', index )
          .addClass( css )
      ;
      // Subtext?
      var subText = $optObj.attr( 'data-subtext' ) || null;
      if(subText) {
        $ddLink.append( $( '<span></span>' ).text(subText) );
        if($optObj.text().length < subText.length) {
          $optObj.attr( 'data-original-text', $optObj.text() );
          $optObj.append( ' <span>(' + subText + ')</span>' );
        }
      }

      // Put it together & return it
      return $('<li></li>').append($ddLink);
    };

    /**
     * Creates an LI to match the given HTML select optgroup.  Note that the optgroups in the faux select are
     * not nested like HTML select optgroups and options.
     *
     * @param $grpObj               The optgroup from which to create the faux optgroup.
     * @returns {*|HTMLElement}     The faux optgroup as a list item with an anchor.
     */
    var createOptGroup = function($grpObj) {
      return $('<li></li>').addClass( 'optgroup' ).text( $grpObj.attr('label') || plugin.settings.fauxOptionDefault );
    };

    var getElId = function() {
      var id = plugin.$el.prop('id') || null;
      if(!id) {
        id = 'xqSelect_' + Math.random().toString(36).substr(2, 9);
        plugin.$el.prop('id', id );
      }

      return id;
    };

    /**
     * Adds text to a faux select option.  In the case of an empty option, adds the default text to both
     * the faux select and the native select.
     *
     * @param $optObj
     * @returns {*|string}
     */
    var getOptionText = function($optObj) {
      var ddText = $optObj.attr('data-original-text') || $optObj.text() || plugin.settings.fauxOptionDefault;
      if(ddText === plugin.settings.fauxOptionDefault) {
        $optObj.html( ddText );
      }

      return ddText;
    };

    var createWrapper = function () {
      var $wrapper = plugin.$el.parents(plugin.sel.wrapper);
      $wrapper.find(plugin.sel.dropdown).remove();
      $wrapper.find(plugin.sel.toggle).remove();

      return $wrapper
          .off()
          .on( 'shown.bs.dropdown', function(e) { plugin.onOpen(e, this); } )
          .on( 'hidden.bs.dropdown', function(e) { $(e.target).removeClass("dropup"); })
          .on( 'keydown', plugin.sel.dropdown, function(e) { if( e.which === 9 ) { plugin.closeDropDown(this); } } )
          .on( 'keydown', plugin.sel.option, function(e) { plugin.onKeyDown( e, this); } )
          .on( 'click', plugin.sel.option, function() { plugin.onClick(this); } )
          ;
    };

    var isMobile = function() {
      return true === (/(android|blackberry|bb10|mobile|iphone|ipad|ipod|opera mini|iemobile|windows phone)/i.test(navigator.userAgent));
    };

    init();
  };

  $.fn.xqselect = function(options) {
    return this.each(function() {
      if (undefined === $(this).data('xqselect')) {
        var plugin = new $.xqselect(this, options);
        $(this).data('xqselect', plugin);
      }
    });
  }
})(jQuery);

$( document ).ready( function () {
  $( '.xq-select' ).xqselect();
} );