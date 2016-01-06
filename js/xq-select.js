$( document ).ready( function () {
    $( '.xq-select > select' ).xqselect();
} );

/**
 * xqSelect v1.0 (https://github.com/exactquery/xq-select)
 *
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

            $( sel ).each( function ( index ) {
                base.RenderSelect(this, index);
            } );

        };

        /**
         * Renders the given select object as an bootstrap dropdown menu and button.
         *
         * @param select    An HTML select object.
         * @param index     The index of this select object within the HTML document.
         */
        base.RenderSelect = function(select, index) {
            var $select = $(select);
            var $wrapper  = $select.parents( base.options.wrapper );
            var $dropdown = $( base.options.templateFauxSelect );
            var target    = $select.prop('id');
            if ( typeof target == 'undefined' ) {
                target = 'xqSelect' + index;
                $select.attr( 'id', target );
            }
            $wrapper.off( 'click', '.xq-select-item' );
            $wrapper.find( '.xq-select-dropdown' ).remove();
            $wrapper.find( 'button' ).remove();
            var opts = $select.children();
            opts.each( function () {
                var $opt = $(this);
                if($opt.prop('tagName') == 'OPTION') {
                    var $ddItem = base.CreateOption( $opt, target );
                    $dropdown.append( $ddItem );
                } else if($opt.prop('tagName') == 'OPTGROUP') {
                    var $groupItem = base.CreateOptGroup( $opt );
                    $dropdown.append( $groupItem );
                    var gOpts = $opt.children();
                    gOpts.each(function() {
                        var $ddItem = base.CreateOption( $(this), target );
                        $dropdown.append( $ddItem );
                    });
                }
            } );
            $select.addClass( 'xq-select-enabled' );
            $wrapper.on( 'click','.xq-select-item', function() { base.onClick(this); } );
            $wrapper.append( $(base.option.templateFauxButton) );
            $wrapper.append( $dropdown );
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
            var $ddLink = $( '<a></a>' );
            var $ddItem = $( '<li></li>' );
            $ddLink.attr( 'data-value', $optObj.val() );
            $ddLink.attr( 'data-target', '#' + target );
            $ddLink.attr( 'data-index', $optObj.index('#' + target + ' option') );
            $ddLink.addClass( 'xq-select-item' );
            if($optObj.prop('selected')) {
                $ddLink.addClass( 'selected' );
            }
            $ddLink.text( $optObj.text() );

            // Disabled
            if($optObj.attr('disabled')) {
                $ddLink.addClass( 'disabled' );
            }

            // Subtext
            if(typeof $optObj.attr('data-original-text') != "undefined") {
                $ddLink.text( $optObj.attr( 'data-original-text' ) );
            }
            var subText = $optObj.attr( 'data-subtext' );
            if(typeof subText != "undefined") {
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
         * Called when an item in the faux select is clicked on.
         *
         * @param obj
         */
        base.onClick = function(obj) {
            var target = $( obj ).attr( 'data-target' );
            $( target ).val( $( obj ).attr( 'data-value' ) );
            $( base.options.fauxOption ).removeClass( 'selected' );
            $( obj ).addClass( 'selected' );
            $(target).trigger('change');
        };

        // Run initializer
        base.init(this);

        return base;
    };

    $.fn.xqselect.defaultOptions = {
        fauxOption: '.xq-select-item',
        trigger : '.xq-select > select',
        wrapper      : '.xq-select',
        templateFauxSelect: '<ul class="dropdown-menu xq-select-dropdown"></ul>',
        templateFauxButton: '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">&nbsp;</button>'
    };
})(jQuery);

/**
 * Credit to Zoltán Tamási - http://stackoverflow.com/questions/21232685/bootstrap-drop-down-menu-auto-dropup-according-to-screen-position
 */
$(document).on("shown.bs.dropdown", ".xq-select", function () {
    // calculate the required sizes, spaces
    var $ul = $(this).children(".dropdown-menu");
    var $button = $(this).children(".dropdown-toggle");
    var ulOffset = $ul.offset();
    // how much space would be left on the top if the dropdown opened that direction
    var spaceUp = (ulOffset.top - $button.height() - $ul.height()) - $(window).scrollTop();
    // how much space is left at the bottom
    var spaceDown = $(window).scrollTop() + $(window).height() - (ulOffset.top + $ul.height());
    // switch to dropup only if there is no space at the bottom AND there is space at the top, or there isn't either but
    // it would be still better fit
    if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown))
        $(this).addClass("dropup");
}).on("hidden.bs.dropdown", ".dropdown", function() {
    // always reset after close
    $(this).removeClass("dropup");
});