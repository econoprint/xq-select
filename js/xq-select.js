$( document ).ready( function () {
    $( '.xq-select > select' ).xqselect();

    $( '.has-error .form-control' ).on('change', function () {
        $( this ).parents( '.has-error' ).removeClass( 'has-error' );
    });
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

        base.init = function(sel){

            base.options = $.extend({},$.fn.xqselect.defaultOptions, options);

            $( sel ).each( function ( index ) {
                base.RenderSelect(this, index);
            } );

        };

        base.RenderSelect = function(sel, index) {
            console.log( 'yay' );
            var $sel = $(sel);
            var $wrapper  = $sel.parents(base.options.wrapper );
            var $dropdown = $( base.options.dropdownTemplate );
            var target    = $sel.prop('id');
            if ( typeof target == 'undefined' ) {
                target = 'xqSelect' + index;
                $sel.attr( 'id', target );
            }
            $wrapper.find( '.xq-select-dropdown' ).remove();
            $wrapper.find( 'button' ).remove();
            var opts = $sel.children();
            opts.each( function () {
                var $opt = $(this);
                if($opt.prop('tagName') == 'OPTION') {
                    var $ddItem = base.CreateOption( $opt, target );
                    $dropdown.append( $ddItem );
                    //$opt.hide();
                } else if($opt.prop('tagName') == 'OPTGROUP') {
                    var $groupItem = base.CreateOptGroup( $opt );
                    $dropdown.append( $groupItem );
                    var gOpts = $opt.children();
                    gOpts.each(function() {
                        var $ddItem = base.CreateOption( $(this), target );
                        $dropdown.append( $ddItem );
                        //$opt.hide();
                    });
                    //$opt.hide();
                }
            } );
            $wrapper.append( $(base.options.btnTemplate) );
            $wrapper.append( $dropdown );
        };

        base.CreateOptGroup = function($grpObj) {
            var groupText = $grpObj.attr('label');
            var $groupItem = $( '<li></li>' );
            $groupItem.addClass( 'optgroup' );
            $groupItem.text( groupText );

            return $groupItem;
        };

        base.CreateOption = function($optObj, target) {
            var $ddLink = $( '<a></a>' );
            var $ddItem = $( '<li></li>' );
            $ddLink.attr( 'data-value', $optObj.val() );
            $ddLink.attr( 'data-target', '#' + target );
            $ddLink.attr( 'data-index', $optObj.index('#' + target + ' option') );
            $ddLink.addClass( 'xq-select-item' );
            if($optObj.prop('selected')) {
                $ddLink.addClass( 'selected' );
            }

            console.log( $optObj );

            if ( $optObj.prop( 'data-original-text' ).length ) {
                $ddLink.text( $optObj.attr( 'data-original-text' ) );
            }
            else {
                $ddLink.text( $optObj );
            }

            // Subtext
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

            $ddItem.append( $ddLink );

            return $ddItem;
        };

        // Run initializer
        base.init(this);

        // Update Select Value on Dropdown Item Click
        $( base.options.dropdownOption ).on( 'click', function () {
            var target = $( this ).attr( 'data-target' );
            $( target ).val( $( this ).attr( 'data-value' ) );
            //$( target ).prop( 'selectedIndex', $( this ).attr( 'data-index' ) );
            $( base.options.dropdownOption ).removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            $(target).trigger("change");
        } );

        return base;
    };

    $.fn.xqselect.defaultOptions = {
        wrapper      : '.xq-select',
        dropdownTemplate: '<ul class="dropdown-menu xq-select-dropdown"></ul>',
        btnTemplate: '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">&nbsp;</button>',
        trigger : '.xq-select > select',
        dropdownOption: '.xq-select-item'
    };
})(jQuery);

/**
 * Credit to Zoltán Tamási
 * http://stackoverflow.com/questions/21232685/bootstrap-drop-down-menu-auto-dropup-according-to-screen-position
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
