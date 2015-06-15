(function(Dashgrid, $){
    /*
     * Método construtor da classe
     * @param { opts | Object } Define permisões de acesso a modulos (Iluminação, Consumo).
     * @method _contructor
     */
    Dashgrid.list = function(opts){

        this.options = {
            permissions:{
                ip: false,
                cm: false
            },
            selector : '#dashgrid-list'
        };

        $.extend(true, this.options, opts);

        console.log("Permissions", this.options);
    };


    Dashgrid.list.prototype.init = function(){

    };


}(window.Dashgrid = window.Dashgrid || {}, jQuery));
