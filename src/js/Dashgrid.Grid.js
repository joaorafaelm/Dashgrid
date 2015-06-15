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
            selector : ".gridster > div",
            controllers:{
                active : true,
                handle : 'handle-controllers',
                options:{
                    resize :{
                        active : true,
                        class : 'size-controller',
                        callback: this._onToggleSizeWidget
                    },
                    close:{
                        active: true,
                        class : 'close-controller',
                        callback: this._onCloseWidget

                    }
                }

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
        this.stateCallback.add([
            this._onSaveWidgetState
        ]);

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
            serialize_params: function($w, wgd) {
                return {
                    'id': parseInt($($w).attr('id')),
                    'data-col': wgd.col,
                    'data-row': wgd.row,
                    'data-sizex': wgd.size_x,
                    'data-sizey': wgd.size_y
                };
            },
            draggable:{
                handle: '.' + this.Opts.controllers.handle,
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

        this.gridster = $(this.Opts.selector)
                        .gridster(gridsterOpts)
                        .data('gridster');
    };

    /**
     * Create widget controllers along with their triggers.
     * @param { widget | DOMelement } widget info.
     * @method _createControllers
     */
    Dashgrid.Grid.prototype._createControllers = function (widget) {
        // console.log("_createControllers", widget);

        var wrapControllers = $('<span/>',{
            class: this.Opts.controllers.handle
        });

        // add all controllers in controllers.options
        for(var i in this.Opts.controllers.options){
            // console.log("Controllers", this.Opts.controllers.options[i]);

            if(this.Opts.controllers.options[i].active){
                wrapControllers = $(wrapControllers).prepend(
                    $('<a/>', {
                    'class': this.Opts.controllers.options[i].class
                }).on('click', widget,
                    $.proxy(this.Opts.controllers.options[i].callback, this)
                ));
            }
        }

        /* expand/collapse controllers */
        widget = $(widget).prepend(wrapControllers);

        return widget;
    };

    /**
     * Add a widget to grid.
     * @param {customProperties | Object} Element custom configuration.
     *        e.g: id, class etc.
     *        Any object attribute will be passed to the element attributes.
     * @method addWidget
     */
    Dashgrid.Grid.prototype.addWidget = function (customProperties) {

        if(customProperties.id){
            customProperties = this.retrieveState(customProperties);
        }

        var properties = {};

        $.extend(true, properties, customProperties);

        var widget = $('<' + this.Opts.widget.selector + '/>', properties);

        widget = this.Opts.controllers.active    ?
                 this._createControllers(widget) :
                 widget
        ;

        if(properties['data-row'] && properties['data-col']){
            this.gridster.add_widget(
                widget,
                properties['data-sizex'] || this.Opts.widget.min_size.x,
                properties['data-sizey'] || this.Opts.widget.min_size.y,
                properties['data-col'],
                properties['data-row']
            );

            this._onToggleSizeWidget({
                    type : 'mouseup',
                    data : widget
            });

        }else{
            this.gridster.add_widget(
                widget,
                properties['data-sizex'] || this.Opts.widget.min_size.x,
                properties['data-sizey'] || this.Opts.widget.min_size.y
            );
        }


        if(!properties.isStored){
            this._onSaveWidgetState();
        }

    };

    /**
     * Remove a widget to grid.
     * @param {widget | DOMelement} Dom element.
     * @method removeWidget
     */
    Dashgrid.Grid.prototype.removeWidget = function (widget) {
        // console.log("removeWidget", widget);
        this.gridster.remove_widget(widget);
        this._onSaveWidgetState();
    };

    /**
     * This method is triggered whenever the widget size changes.
     * And it is automatically binded to the controllers when they are created.
     * @param {context | Object} Receives the event type
     *        'click' (from controllers) or 'mouseup' (from manual resize).
     * @method _onToggleSizeWidget
     */
    Dashgrid.Grid.prototype._onToggleSizeWidget = function (context) {
        // console.log("_onToggleSizeWidget", context);
        var widget = context.data ?
                     context.data :
                     $(context.target).closest(this.Opts.widget.selector);

        var button = $(widget).find('a.size-controller');

        //verify if widget is expanded.
        var is_expanded = parseInt(widget.attr('data-sizex')) == this.Opts.widget.max_size.x ?
                          true :
                          false
        ;

        //no need to resize again. if widget was manually resized.
        if(context.type == 'mouseup'){
            //change text
            $(button).toggleClass('sz-collapse', is_expanded);
            return true;
        }

        //toggle button text
        $(button).toggleClass('sz-collapse');
        this.gridster.resize_widget(
            widget ,
            //if expanded, set x equal to minimum, else, x maximum.
            (is_expanded ?
                this.Opts.widget.min_size.x :
                this.Opts.widget.max_size.x
            ),
            this.Opts.widget.max_size.y
        );

        this._onSaveWidgetState();
    };

    /**
     * This method is triggered whenever the widget close button is clicked..
     * And it is automatically binded to the controllers when they are created.
     * @param {context | Object} Receives the event type
     *        'click' (from controllers) or 'mouseup' (from manual resize).
     * @method _onToggleSizeWidget
     */
    Dashgrid.Grid.prototype._onCloseWidget = function (context) {
        // console.log("_onCloseWidget", context);
        var widget = context.data ?
                     context.data :
                     $(context.target).closest(this.Opts.widget.selector);

        //added hide to widget, so it wont delay hiding.
        widget.hide();
        this.removeWidget(widget);
    };

    /**
     * This method is called when the widget is dragged, resized or removed.
     * It will save the widget position.
     * @param {context | DOMelement } Receives the DOM element.
     * @method _onSaveWidgetState
     */
    Dashgrid.Grid.prototype._onSaveWidgetState = function (context) {
        // console.log("_onSaveWidgetState", this.gridster.serialize());

        if(typeof(Storage) !== "undefined") {
            localStorage.setItem(
                'gridState',
                JSON.stringify(this.gridster.serialize())
            );
        }
    };


    /**
     * This method will be called when a widget is added.
     * It will check the localStorage for a previous position.
     * @param { element | object } Receive all properties from the element.
     * @method retrieveState
     */
    Dashgrid.Grid.prototype.retrieveState = function (element) {
        // console.log("retrieveState", element);

        if(typeof(Storage) !== "undefined") {
            var dataStored = JSON.parse(localStorage.getItem("gridState"));
            if(dataStored !== null){
                for (var i = 0; i < dataStored.length; i++) {
                    if(dataStored[i].id == element.id){
                        $.extend(true, element, dataStored[i]);
                        element.isStored = true;
                        break;
                    }
                }
            }
        }

        return element;
    };



}(window.Dashgrid = window.Dashgrid || {}, jQuery));
