$( document ).ready( function () {
    $( '.xq-select > select' ).xqselect();
} );

/**
 * xqSelect v1.1.4 (https://github.com/exactquery/xq-select)
 * @author  Aaron M Jones [aaron@jonesiscoding.com]
 * @licence MIT (https://github.com/exactquery/xq-select/blob/master/LICENSE)
 */
(function($){
    $.fn.xqselect = function(options){

        var base = this;

        /**
         * Loops through the given selectors to turn them into faux select boxes.
         *
         * @param sel   The selector for the object.
         */
        base.init = function(sel){
            base.options = $.extend({},$.fn.xqselect.defaultOptions, options);
            base.$all = $(sel);
            if(base.$all.length <= base.options.fauxLimit) {
                base.$all.each( function ( index ) {
                    base.RenderSelect(this, index);
                } );
            }
        };

        /**
         * Renders the given select object as an bootstrap dropdown menu and button.
         *
         * @param select    An HTML select object.
         * @param index     The index of this select object within the HTML document.
         */
        base.RenderSelect = function(select, index) {
            var $select = $(select);
            // Get the Wrapper and Remove xqSelect and Events
            var $wrapper  = $select.parents( base.options.wrapper );
            $wrapper.off();
            $wrapper.find( '.xq-select-dropdown' ).remove();
            $wrapper.find( 'button' ).remove();
            // Only add the faux select if we're supposed to
            if( $wrapper.attr('data-native') !== 'true' && !(base.isMobile() && $wrapper.attr('data-mobile') === 'true' )) {
                var $dropdown = $( base.options.templateFauxSelect );
                var $button = $(base.options.templateFauxButton);
                var tabIndex = (typeof $select.attr( 'tabindex' ) !== 'undefined') ? $select.attr('tabindex') : 0;
                var target    = $select.prop('id');
                if ( typeof target === 'undefined' ) {
                    target = 'xqSelect' + index;
                    $select.attr( 'id', target );
                }
                var opts = $select.children();
                opts.each( function () {
                    var $opt = $(this);
                    if($opt.prop('tagName') === 'OPTION') {
                        var $ddItem = base.CreateOption( $opt, target );
                        $dropdown.append( $ddItem );
                    } else if($opt.prop('tagName') === 'OPTGROUP') {
                        var $groupItem = base.CreateOptGroup( $opt );
                        $dropdown.append( $groupItem );
                        var gOpts = $opt.children();
                        gOpts.each(function() {
                            var $ddItem = base.CreateOption( $(this), target);
                            $dropdown.append( $ddItem );
                        });
                    }
                } );
                $dropdown.find('a').eq($select.prop('selectedIndex')).addClass('selected');
                $button.attr( 'tabindex', tabIndex );
                $select.addClass( 'xq-select-enabled' ).attr( 'tabindex', '-1' );
                $wrapper.on( 'shown.bs.dropdown', function() { base.onOpen(this); } );
                $wrapper.on( 'keydown', '.xq-select-dropdown', function(e) { if( e.which === 9 ) { base.closeDropDown(this); } } );
                $wrapper.on( 'keydown', '.xq-select-item', function(e) { base.onKeyDown( e, this); } );
                $wrapper.on( 'click','.xq-select-item', function() { base.onClick(this); } );
                $wrapper.append( $button );
                $wrapper.append( $dropdown );

            }
        };

        /**
         * Creates an LI to match the given HTML select optgroup.  Note that the optgroups in the faux select are
         * not nested like HTML select optgroups and options.
         *
         * @param $grpObj               The optgroup from which to create the faux optgroup.
         * @returns {*|HTMLElement}     The faux optgroup as a list item with an anchor.
         */
        base.CreateOptGroup = function($grpObj) {
            var groupText = $grpObj.attr('label');
            var $groupItem = $( '<li></li>' );
            $groupItem.addClass( 'optgroup' );
            $groupItem.text( groupText );

            return $groupItem;
        };

        /**
         * Creates an LI to match the given HTML select option.
         *
         * @param $optObj               The option from which to create the faux option.
         * @param target                The ID of the faux select dropdown.
         * @returns {*|HTMLElement}     The faux option as a list item with an anchor.
         */
        base.CreateOption = function($optObj, target) {
            // Basics
            target = '#' + target;
            var index = $optObj.index(target + ' option');
            var $ddLink = $( '<a tabindex="' + index + '"></a>' );
            var $ddItem = $( '<li></li>' );
            $ddLink.html( base.OptionText( $optObj ) );
            $ddLink.attr( 'data-value', $optObj.val() );
            $ddLink.attr( 'data-target', target );
            $ddLink.attr( 'data-index', index );
            $ddLink.addClass( 'xq-select-item' );
            // Disabled?
            if($optObj.attr('disabled')) {
                $ddLink.addClass( 'disabled' );
            }
            // Subtext?
            if(typeof $optObj.attr('data-original-text') !== "undefined") {
                $ddLink.text( $optObj.attr( 'data-original-text' ) );
            }
            var subText = $optObj.attr( 'data-subtext' );
            if(typeof subText !== "undefined") {
                var $subText = $( '<span></span>' );
                $subText.text( subText );
                $ddLink.append( $subText );
                if($optObj.text().length < subText.length) {
                    $optObj.attr( 'data-original-text', $optObj.text() );
                    $optObj.append( ' <span>(' + subText + ')</span>' );
                }
            }
            // Put it together & return it
            $ddItem.append( $ddLink );

            return $ddItem;
        };

        /**
         * Adds text to a faux select option.  In the case of an empty option, adds the default text to both
         * the faux select and the native select.
         *
         * @param $optObj
         * @returns {*|string}
         */
        base.OptionText = function($optObj) {
            var ddText = $optObj.text() || base.options.fauxOptionDefault;
            if(ddText === base.options.fauxOptionDefault) {
                $optObj.html( base.options.fauxOptionDefault );
            }

            return ddText;
        };

        /**
         * Called when an item in the faux select is clicked on.
         *
         * @param obj
         */
        base.onClick = function(obj) {
            var $obj = $( obj );
            var $target = $($obj.attr( 'data-target' ));
            var $dropdown = $obj.parents( '.xq-select-dropdown' ) ;
            if(!$obj.hasClass('disabled')) {
                $target.val( $obj.attr( 'data-value' ) );
                $dropdown.find( base.options.fauxOption ).removeClass( 'selected' );
                $obj.addClass( 'selected' );
                $target.trigger('change');
            }
            $obj.parents('.xq-select-dropdown' ).prev( '.dropdown-toggle' ).focus();
        };

        /**
         * Called when a key is pressed while a faux select option is in focus.
         *
         * @param e       The event that triggered this.
         * @param obj     The faux select option (li > a).
         */
        base.onKeyDown = function(e,obj) {
            var key = e.which;
            if(key === 13) {
                e.preventDefault();
                $( obj ).click();
            }
        };

        /**
         * Focuses on the currently selected item.  Called when a faux select is opened.
         *
         * @param obj The faux select object (ul)
         */
        base.onOpen = function(obj) {
            $( obj ).find('.xq-select-item.selected' ).focus();
        };

        /**
         * Closes the dropdown for the given object. Called when the TAB key is pressed with a faux select in focus.
         * This is used instead of the dropdown('toggle') method because that seems to mess with other events.
         *
         * @param obj The faux select object (ul)
         */
        base.closeDropDown = function(obj) {
            $( obj ).parent( base.options.wrapper ).removeClass( 'open' );
            $( obj ).prev( '.dropdown-toggle' ).attr( 'aria-expanded', false );
        };

        base.isMobile = function() {
            return true === (/(android|blackberry|bb10|mobile|iphone|ipad|ipod|opera mini|iemobile|windows phone)/i.test(navigator.userAgent));
        };

        // Run initializer
        base.init(this);

        return base;
    };

    $.fn.xqselect.defaultOptions = {
        fauxOption:         '.xq-select-item',
        trigger:            '.xq-select > select',
        wrapper:            '.xq-select',
        templateFauxSelect: '<ul class="dropdown-menu xq-select-dropdown" role="menu"></ul>',
        templateFauxButton: '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&nbsp;</button>',
        fauxLimit:          20,
        fauxOptionDefault:  '--'
    };
})(jQuery);

/**
 * Credit to Zoltán Tamási -
 * http://stackoverflow.com/questions/21232685/bootstrap-drop-down-menu-auto-dropup-according-to-screen-position
 */
$(document).on("shown.bs.dropdown", ".xq-select", function () {
    // calculate the required sizes, spaces
    var $txqs = $(this);
    var $ul = $txqs.children(".dropdown-menu");
    var $button = $txqs.children(".dropdown-toggle");
    var ulOffset = $ul.offset();
    // how much space would be left on the top if the dropdown opened that direction
    var spaceUp = (ulOffset.top - $button.height() - $ul.height()) - $(window).scrollTop();
    // how much space is left at the bottom
    var spaceDown = $(window).scrollTop() + $(window).height() - (ulOffset.top + $ul.height());
    // switch to dropup only if there is no space at the bottom AND there is space at the top, or there isn't either but
    // it would be still better fit
    if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown)) {
        $txqs.addClass("dropup");
    }
}).on("hidden.bs.dropdown", ".xq-select", function() {
    // always reset after close
    $(this).removeClass("dropup");
});