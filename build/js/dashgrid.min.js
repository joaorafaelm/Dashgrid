(function (Dashgrid,  $, undefined) {
    "use strict";
    /**
     This class provides javascript handling specific to the page. Most importantly, it provides the gridster
     setup and handling.
     @class   Grid
     @version 0.1
     @param   {DomSelector | String} Selector which gridster will be instantiated.
     @param   {Opts | Object} Class options.
     @param   {Config | Object} Gridster custom options.
     @constructor
     */
    Dashgrid.Grid = function (CustomOpts) {
        this.Opts = {
            selector : ".gridster > ul", 
            controllers:{
                active : true,
                class  : 'size-controller'
            },
            resize: true,
            min_cols: 2,
            max_cols: 2,
            widget: {
                selector   : "div",
                dimensions : [300, 100],
                margins    : [5, 5],
                min_size   : { x: 1, y: 2 }, 
                max_size   : { x: 2, y: 2},
                min_size_x: 1, 
                min_size_y: 2,
                max_size_x: 2,
                max_size_y: 2
            }
        };
        // override default options.
        $.extend( true, this.Opts, CustomOpts );

        // create callbacks
        this.stateCallback = $.Callbacks();
        this.stateCallback.add([this._onToggleSizeWidget, this._onSaveWidgetState]);

        // init gridster
        this.init();
    };

    /**
     * Instantiate gridster
     * @method init
     */
    Dashgrid.Grid.prototype.init = function () {
        
        var gridsterOpts = {
            widget_margins: this.Opts.widget.margins,
            widget_base_dimensions: this.Opts.widget.dimensions,
            min_cols: this.Opts.min_cols,
            max_cols: this.Opts.max_cols,
            draggable:{
                stop: $.proxy(this.stateCallback.fire, this)
            },
            resize: {
                enabled: this.Opts.resize,
                stop: $.proxy(this.stateCallback.fire, this),
                max_size: [
                    this.Opts.widget.max_size.x, 
                    this.Opts.widget.max_size.y
                ],
                min_size: [
                    this.Opts.widget.min_size.x, 
                    this.Opts.widget.min_size.y
                ]
            }
        };
        
        this.gridster = $(this.Opts.selector).gridster(gridsterOpts).data('gridster');
    };
    
    /**
     * Create widget controllers along with their triggers.
     * @param { widget | DOMelement } widget info.
     * @method _createControllers
     */
    Dashgrid.Grid.prototype._createControllers = function (widget) {
        // console.log("_createControllers", widget);
        
        /* expand/collapse controllers */
        widget = $(widget).prepend(
            $('<a/>', {
                'class': this.Opts.controllers.class
            }).on('click', widget, $.proxy(this.stateCallback.fire, this))            
        );
        
        return widget;
    };

    /**
     * Add a widget to grid.
     * @param {customProperties | Object} Element custom configuration. e.g: id, class etc.
     *        Any object attribute will be passed to the <li/> element attribute.    
     * @method addWidget
     */
    Dashgrid.Grid.prototype.addWidget = function (customProperties) {
        
        var properties = {
            'id':'',
            'class':'',
            'text':'Text Only'
        };
        
        $.extend(true, properties, customProperties);
        var widget = $('<' + this.Opts.widget.selector + '/>', properties);
        
        widget = this.Opts.controllers.active ? this._createControllers(widget) : widget;
        this.gridster.add_widget(
            widget, 
            this.Opts.widget.min_size.x,
            this.Opts.widget.min_size.y
        );
        
    };
    
    /**
     * Remove a widget to grid.
     * @param {widget | DOMelement} Dom element.
     * @method removeWidget
     */    
    Dashgrid.Grid.prototype.removeWidget = function (widget) {
        this.gridster.remove_widget(widget);
    };
    
    /**
     * This method is triggered whenever the widget size changes.
     * And it is automatically binded to the controllers when they are created.
     * @param {context | Object} Receives the event type 'click' (from controllers) or 'mouseup' (from manual resize).
     * @method _onToggleSizeWidget
     */
    Dashgrid.Grid.prototype._onToggleSizeWidget = function (context) {
        // console.log("_onToggleSizeWidget", context);
        var widget = context.data ? context.data : $(context.target).closest(this.Opts.widget.selector);
        var button = $(widget).find('a.size-controller');
        
        //verify if widget is expanded.
        var is_expanded = parseInt(widget.attr('data-sizex')) == this.Opts.widget.max_size.x ?
                          true :
                          false
        ;
        
        //no need to resize again. if widget was manually resized.
        if(context.type == 'mouseup'){
            //change text
            $(button).toggleClass('collapse', is_expanded);
            return true;            
        }
               
        //toggle button text
        $(button).toggleClass('collapse');
        this.gridster.resize_widget( 
            widget ,
            //if expanded, set x equal to minimum
            (is_expanded ? this.Opts.widget.min_size.x : this.Opts.widget.max_size.x), 
            this.Opts.widget.max_size.y 
        );
        
    };
    
    /**
     * @todo
     * This method is called when the widget is dragged, resized or removed.
     * It will save the widget position.
     * @param {context | DOMelement } Receives the DOM element.
     * @method _onSaveWidgetState
     */
    Dashgrid.Grid.prototype._onSaveWidgetState = function (context) {
        console.log("_onSaveWidgetState", context);
    };
    
}(window.Dashgrid = window.Dashgrid || {}, jQuery));
