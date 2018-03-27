/**
 * xqSelect v3.1.4 (https://github.com/exactquery/xq-select)
 * @author  AMJones [am@jonesiscoding.com]
 * @licence MIT (https://github.com/exactquery/xq-select/blob/master/LICENSE)
 */
;(function($) {

  $.xqselect = function(el, options) {
    var defaults = {
      api: ['mobile'],
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
      mobile: false,
      native: false
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

      var use = (plugin.settings.native !== 'true') &&
          !(plugin.$el.prop('disabled') || plugin.$el.prop('readonly')) &&
          (!isMobile() || plugin.settings.mobile === 'true')
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
              addOptions(
                  $('<ul></ul>').attr(plugin.settings.attr.dropdown)
                      .addClass(plugin.settings.cls.dropdown)
              )
          )
      ;
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