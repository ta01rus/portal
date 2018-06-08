define(['jquery',
    'underscore',
    'backbone',
    'core/config'
], function ($, _, Backbone,  config) {
    //*************************GLOBAL VAR************************************************/
    var views       = views || {};
    var collections = collections || {};
    var models      = models || {};

    //*************************Models************************************************/
    models.bb_model_view  = Backbone.Model.extend({
        /**
         *  Модель и колекця списка набора товара к формированию заказа
         */
        url : config.url,
        completed : false,
        defaults :{
            form_object : {}
        },
        JSON: function() {
            let json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            return json;
        },
        toJSON: function() {
            let json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            json.CID = this.cid;
            return json;
        },

    }) ;
    models.bb_model_basket_rec  = Backbone.Model.extend({
        /**
         *  Модель и колекця списка набора товара к формированию заказа
         */
        url : config.url,
        completed : false,
        defaults :{
           stok_id : 0,
           qty     : 0,
        },
        JSON: function() {
            let json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            return json;
        },
        toJSON: function() {
            let json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            json.CID = this.cid;
            return json;
        },

    }) ;
    models.bb_model_breadcrumb  = Backbone.Model.extend({
        /**
         * Модел "Хлебных крошек"
         */
        url : config.url,
        completed : false,
        defaults :{
            name : "",
            href : ""
        },
        JSON: function() {
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            return json;
        },
        toJSON: function() {
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            json.CID = this.cid;
            return json;
        },

    }) ;
    //*************************Collections************************************************/
    collections.bb_coll_views = Backbone.Collection.extend({
        /**
         * Коллекция набора товара в корзине
         */
        model : models.bb_model_view,
        initialize : function(){
        }
    });
    collections.bb_coll_basket_qtys = Backbone.Collection.extend({
        /**
         * Коллекция набора товара в корзине
         */
        model : models.bb_model_basket_rec,
        initialize : function(){
        }
    });
    collections.bb_coll_breadcrumb  = Backbone.Collection.extend({
        /**
         * Коллекция пути в хлебных крошках
         * */
        model : models.bb_model_breadcrumb,
        initialize : function(){
        }
    });
    //*************************VIEWS CORE************************************************/
    views.bb_view = Backbone.View.extend({
        /**
         * Первичный прототип
         * */
        model: undefined,
        tagName: "div",
        name: "main",
        exec: function (func_name, in_param, done_function) {
            let prm_name = [this.name, func_name];
            let _prm = prm_name.concat(in_param);
            if (typeof this["done_" + func_name] !== undefined) {
                $.when($.post(config.url, {prm: _prm}))
                    .done($.proxy(done_function, this, _prm));
            }
        }
    });

    views.bb_breadcrumb         = views.bb_view.extend({
        /**
         * View по управлениею хлебными крошками
         */
        el : "#breadcrumb",
        coll : new collections.bb_coll_breadcrumb(),
        events : {
            'click .breadcrumb-item' : 'click_breadcrumb_item'
        },
        click_breadcrumb_item : function(e){

        },
        render : function(){

        },
        add_path : function(){

        }
    });
    views.bb_form_modal         = views.bb_view.extend({
        /**
         * Модальная форма
         */
        el: "#mod-form",
        caller: undefined,
        name: "form_modal",
        initialize: function () {

        },
        render: function (form_main) {
            this.template_form = _.template(form_main);
            this.$el.html(this.template_form());
            this.delegateEvents();
        },
        append: function () {

        },
        close: function () {

            $('#mod-form').modal("hide");

        },
        action: function (event) {
            if (this.caller != undefined) {
                this.caller[act](event);
            }
            $(this.$el.selector).modal("hide");
        },
        setCaller : function (_caller) {
            this.caller = _caller;
        },
        show : function(){
            $('#mod-form').modal("show");
        }
    });
    views.bb_form_basket        = views.bb_view.extend({
        modal : undefined,
        el: "#right-line",
        name: "form_basket",
        initialize: function () {
            this.init_modal();
            this.bay_list = new collections.bb_coll_basket_qtys();
        },
        events: {
            'click .btn-bsk-delete' : 'click_delete',
            'click #btn-open-sales_basket' : 'click_open_form_sales_basket',
            'click #btn-clear-basket' : 'click_clear_basket'
        },
        /*Управление модальной формой*/
        init_modal : function(){

            this.modal =  new views.bb_form_modal();
            this.modal.events = {
                'click #btn-add-item': 'click_add_item',
                'change .bskt-add-qty' : 'change_qty_add'
            };
            this.modal.click_add_item =  $.proxy(this.mod_add_item, this);
            this.modal.change_qty_add =  $.proxy(this.mod_change_qty_add, this);
            this.modal.change_qty_add_in_sale = $.proxy(this.mod_change_qty_add_in_sale, this);
            this.modal.setCaller(this);
        },
        /**
         *  Функция добавляет товар под заказ
         * @param e
         */
        mod_change_qty_add_in_sale : function(e){

        },
        /**
         * Функция формирует колекцию набора
         * @param e
         */
        mod_change_qty_add : function(e){
            let obj         =  e.currentTarget;
            let stok_id     =  $(obj).attr("data-item");
            let val         = $(obj).val();
            let mod         = this.bay_list.get(stok_id);
            if(mod != undefined ) {
                mod.set({qty: val});
            } else {
                this.bay_list.add({id: stok_id , stok_id : stok_id , qty : val});
            }
        },
        /**
         *  Добавление номенклатур в корзину
         * @param e
         */
        mod_add_item : function(e){

            let list = this.bay_list.toJSON();
            let param = [list];

            this.exec("add_item_list", param, function (_prm, data){
                this.render();
                this.bay_list.reset();
                this.modal.close()
            });
        },
        click_delete : function(e){
            let id = this.get_id(e);
            let param = [id];
            this.exec("delete", param, function (_prm, data){
                this.render();
            });
        },
        /* Открыите формы списка корзины  */
        click_open_form_sales_basket : function(e){
            let path = "form_sales/basket";
            this.set_navigate("form_sales", path, true, false);
        },
        /* Сброс карзины  */
        click_clear_basket : function(e) {
            let param = [];
            this.exec("clear_basket", param, function (_prm, data){
                try {
                    let json = JSON.parse(data);
                    console.log(json);
                    if(json[0].res == 'ok'){
                         this.render();
                    }
                } catch(e){
                    console.log(e);
                    console.log(data);
                }

                this.render();
            });
        },
        /*Нарисовать */
        render: function () {
            this.bay_list.reset();
            let _prm = [this.name];
            $.when($.post(config.url, {prm: _prm}))
                .done($.proxy(function (form_main) {
                        try {
                            this.template_form = _.template(form_main);
                            this.$el.html(this.template_form());
                            this.delegateEvents();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    , this));
        },
        /*Открыите формы добавления */
        open_form_add : function(main_id){
            param = [main_id];
            this.exec("open_form_add", param, function (_prm, data){
                this.modal.undelegateEvents();
                this.modal.render(data);
                this.modal.show();
            });

        },
        get_id: function (e) {
            var obj = e.currentTarget;
            var id = $(obj).attr("ID").split("-")[1];
            return id;
        },
        set_navigate: function (name, path, trigger, replace) {
            views.router.navigate(path, {trigger: trigger, replace: replace});
        }
    });
    views.bb_form_progress = views.bb_view.extend({
        el: "#mod-form-progress",
        name: "form_progress",
        initialize: function () {
        },
        render: function (form_main) {
        },
        close: function () {
            $('#mod-form-progress').modal("hide");
        },
        show: function () {
            $('#mod-form-progress').modal("show");
        }

    });



    views.progress = new views.bb_form_progress();
    views.basket = new views.bb_form_basket();

    views.super_view            = views.bb_view.extend({
        basket : views.basket,
        progress: views.progress,
        tagName: "div",
        name: "main",
        initialize: function () {
            if(this.modal == undefined) {
                this.modal = new views.bb_form_modal();
                this.modal.setCaller(this);
            }
            this.basket.render();
        },
        render: function (_prm) {
            /*Открывать песочные часы */
            this.progress.show();
            $.when($.post(config.url, {prm: _prm}))
                .done($.proxy(function (form_main) {
                        try {
                            this.template_form = _.template(form_main);
                            this.$el.html(this.template_form());
                            this.$el.scroll($.proxy(this.on_scroll, this));
                            this.delegateEvents();
                           this.progress.close();

                        } catch (e) {
                            console.log(e);
                            console.log(nodes_data);
                            console.log(form_main);
                        }
                    }
                    , this));
        },
        on_scroll: function (e) {
            console.log(e);
        },
        get_id: function (e) {
            var obj = e.currentTarget;
            var id = $(obj).attr("ID").split("-")[1];
            return id;
        },
        get_navi_name: function (e) {
            var obj = e.currentTarget;
            var name = $(obj).attr("data-navi");
            return name;
        },
        on_load: function (data) {

        },
        stopBubble: function (e) {
            e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
        },
        add_navi_panel: function (name, path) {

        },
        set_navigate: function (name, path, trigger, replace) {
            this.add_navi_panel(name, path);
            views.router.navigate(path, {trigger: trigger, replace: replace});
        }
    });
    //*************************VIEWS************************************************/
    views.bb_form_login         = views.super_view.extend({
        /**
         * Регистрация пользователя
         */
        tagName: "div",
        el: "#form_login",
        obj_append: undefined,
        name: "form_login",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
            this.init()
            this.render();
        },
        events: {
            'click #btn-sigin': 'click_signin',
            'click #btn-registr': 'click_registr',
            'click #btn-out-login': 'click_out',
            'click #login-icon': 'cliked_login_icon'
        },
        init : function(){
           var param = [];
           this.exec('have_basket',param, function (_prm, data) {
               try{


               } catch(e) {
                   console.log(e);
                   console.log(data);
               }
           });
        },
        render: function () {
            var _prm = [this.name];
            $.when($.post(config.url, {prm: _prm}))
                .done($.proxy(function (form_main) {
                        try {
                            this.template_form = _.template(form_main);
                            this.$el.html(this.template_form());
                            this.delegateEvents();

                        } catch (e) {
                            console.log(e);
                            console.log(nodes_data);
                            console.log(form_main);
                        }
                    }
                    , this));
        },
        cliked_login_icon: function (e) {
            $("*").removeClass("active");
            let path = "form_registration/profile";
            this.set_navigate("form_registration", path, true, false);
        },
        click_out: function (e) {
            $("*").removeClass("active");
            var parm = [$("#login").val(), $("#passw").val()];
            this.exec("signout", parm, function (_prm, data) {
                try {
                    this.template_form = _.template(data);
                    this.$el.html(this.template_form());
                    this.delegateEvents();

                } catch (e) {
                    console.log(e);
                    console.log(nodes_data);
                    console.log(form_main);
                }
            });
        },

        click_signin: function (e) {
            $("*").removeClass("active");
            var parm = [$("#login").val(), $("#passw").val()];
            this.exec("signin", parm, this.done_signin);

        },
        done_signin: function (_prm, data) {
            try {
                this.template_form = _.template(data);
                this.$el.html(this.template_form());
                this.delegateEvents();
                views.basket.render();
            } catch (e) {
                console.log(e);
                console.log(nodes_data);
                console.log(form_main);
            }

        },
        click_registr: function (e) {
            $("*").removeClass("active");
            var path = "form_registration";
            this.set_navigate("form_registration", path, true, false);
        }


    });
    views.bb_form_registration  = views.super_view.extend({
        /**
         * Форма регистрации
         */
        model: undefined,
        el: "#body-desktop",
        name: "form_registration",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
            $('#navi-panel').addClass("invisible");
            this.$login = $("#login-input");
            this.$passw = $("#password-input");
        },
        events: {
            "click #btn-reg-user": "click_reg_user",
            "change #login-input": "change_login",
            "click #btn-upd-user": 'cliked_upd_user'
        },
        cliked_upd_user: function (e) {
            var param = [$("#price-group").val(), $("#email-input").val()];
            this.exec("upd_user", param, function (_prm, data) {
                console.log(data);
            });
        },

        click_reg_user: function (e) {
            var param = [$("#login-input").val(), $("#password-input").val(), $("#price-group").val()];
            this.exec("reg_user", param, this.done_reg_user);
        },
        change_login: function (e) {
            var param = [$("#login-input").val()];
            this.exec("check_name", param, this.done_check_name);
        },
        done_reg_user: function (_prm, data) {
            try {
                $("#login-input").removeClass("is-invalid");
                $("#login-input").removeClass("is-valid");
                var json = JSON.parse(data);
                if (json.length == 0) {
                    //Зеленый
                    $("#login-input").addClass("is-valid");
                } else {
                    //Красный
                    $("#login-input").addClass("is-invalid");

                }
            } catch (e) {
                console.log(data);
                throw new TypeError(e);
            }
        },
        done_check_name: function (data) {
            try {
                $("#login-input").removeClass("is-invalid");
                $("#login-input").removeClass("is-valid");
                var json = JSON.parse(data);
                if (json.length == 0) {
                    //Зеленый
                    $("#login-input").addClass("is-valid");
                } else {
                    //Красный
                    $("#login-input").addClass("is-invalid");

                }
            } catch (e) {
                console.log(data);
                throw new TypeError(e);
            }
        }

    });
    views.bb_form_item          = views.super_view.extend({
        /**
         * Форма номенклатуры
         */
        model: undefined,
        el: "#body-desktop"
    });
    views.bb_navi_menu          = views.super_view.extend({
        /**
         * Левое меню
         */
        tagName: "div",
        el: "#navi-menu",
        obj_append: undefined,
        name: "form_navi_menu",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
            this.render();
        },
        events: {
            'click .navi-menu-item': 'click_menu'
        },
        render: function () {
            var _prm = [this.name];
            $.when($.post(config.url, {prm: _prm}))
                .done($.proxy(function (form_main) {
                        try {
                            this.template_form = _.template(form_main);
                            this.$el.html(this.template_form());
                            this.delegateEvents();

                        } catch (e) {
                            console.log(e);
                            console.log(nodes_data);
                            console.log(form_main);
                        }
                    }
                    , this));
        },
        click_menu: function (e) {
            var obj = e.currentTarget;
            $(".navi-menu-item").removeClass("active");

            $(obj).addClass("active");

            var name = this.get_navi_name(e);
            var path = $(obj).attr("data-path");

            this.set_navigate(name, path, true, false);

        }

    });
    views.bb_navi_panel         = views.super_view.extend({

        tagName: "div",
        el: "#navi-panel",
        obj_append: undefined,
        name: "form_navi_panel",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
            this.$panel_body = $("#panel-body");

            this.render();
        },
        events: {
            'click .navi-menu-item': 'click_menu',
            'click .breadcrumb-item': 'click_item'
        },
        render: function () {
            var _prm = [this.name];
            $.when($.post(config.url, {prm: _prm}))
                .done($.proxy(function (form_main) {
                        try {
                            this.template_form = _.template(form_main);
                            this.$el.html(this.template_form());
                            this.delegateEvents();

                        } catch (e) {
                            console.log(e);
                            console.log(nodes_data);
                            console.log(form_main);
                        }
                    }
                    , this));
        },
        /**
         *"
         */
        add_navi: function (model) {
            var mod_json = model.toJSON();
            $("#panel-body").append(this.template({MOD: mod_json}));
            model.set({render: true});
        },
        remove_navi: function (model) {
            var mod_json = model.toJSON();
            $("#" + mod_json.CID).remove();
        },
        reset_navi: function () {
            $("#panel-body").html("");

        },
        click_item: function (e) {
            let obj = e.currentTarget;
            let cid = $(obj).attr("id");

            let mod_json = mod.toJSON();


        },
        template: _.template('<li id="<%=MOD.CID%>"  class="breadcrumb-item"><a href="<%=MOD.URL%>"><%=MOD.NAME%></a></li>'),


    });
    views.bb_form_nodes         = views.super_view.extend({
        /**
         * Форма узлов
         */
        model: undefined,
        el: "#body-desktop",
        name: "form_nodes",
        breadcrumb : new collections.bb_coll_breadcrumb(),
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
            $('#navi-panel').removeClass("invisible");
        },
        events: {
            'click  .nodes-item': 'click_node_item',
            'click  .nodes-items': 'click_group_items',
            'click  .nodes-groups': 'click_group',
            'click  .nodes-groups-group': 'click_group',
            'click  .nodes-group-items': 'click_group_items',
            'click  .info-item': 'click_node_item',
            'click  .btn-add-basket': 'click_add_basket',
            'click  .breadcrumb-item': 'click_breadcrumb_item',
            'mouseover .nodes-image-item' : 'mouseover_nodes_image',
            'mouseout .nodes-image-item' : 'mouseout_nodes_image'
        },
        /**
         * Добавляет в навигатор х/к
         * @param _name
         * @param _href
         */
        add_breadcrumb_item : function(_name, _href) {
            let cnt = this.breadcrumb.length;
            this.breadcrumb.add({id:cnt, name: _name, href: _href });
            this.render_breadcrumb();
        },
        click_breadcrumb_item : function(e){

        },
        click_add_basket : function(e){
            var obj = e.currentTarget;
            var id = $(obj).attr("data-item");
            this.basket.bay_list.reset();
            this.basket.open_form_add(id);
        },
        click_node_item: function (e) {
            var id = this.get_id(e);
            var name = this.get_navi_name(e);
            var path = "/form_item/item/" + id;
            this.add_breadcrumb_item(name, path);
            this.set_navigate(name, path, true, false);
            this.stopBubble(e)
        },
        click_group: function (e) {
            var id = this.get_id(e);
            var name = this.get_navi_name(e);
            var path = this.name + "/groups/" + id;
            this.add_breadcrumb_item(name, path);
            this.set_navigate(name, path, true, false);
            this.stopBubble(e)
        },
        click_group_items: function (e) {
            var id = this.get_id(e);
            var name = this.get_navi_name(e);
            var path = this.name + "/items/" + id;

            this.add_breadcrumb_item(name, path);

            this.set_navigate(name, path, true, false);
            this.stopBubble(e)
        },
        mouseover_nodes_image:  function(e){
            /*   let obj =  e.currentTarget;
               $(obj).css("width", "500px");
               $(obj).css("z-index", "9999");
               $(obj).css("position", "absolute"); */

        },
        mouseout_nodes_image : function(e){
            /*  let obj =  e.currentTarget;
              $(obj).css("width", "");
              $(obj).css("z-index", "");
              $(obj).css("position", ""); */
        },
        render_breadcrumb : function(){
            /*this.breadcrumb.forEach(function (mod) {
             //  console.log(mod);
            }) ; */
        },
        /**
         * Переход по хлеб крошкам
         * @param e
         */
        render_breadcrumb : function(){
            /*this.breadcrumb.forEach(function (mod) {
             //  console.log(mod);
            }) ; */

        }
    });
    views.bb_form_serch         = views.super_view.extend({
        /**
         * Форма поиска
         */
        model: undefined,
        el: "#form_serch",
        name: "form_serch",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click #btn-serch': "click_btn_serch"
        },
        render : function(param){

        },
        click_btn_serch : function(e){
            let val = $("#inp-serch").val();
            var path =  'form_serch_page' + "/serch/" + val+"/"+1+"/"+'10';
            this.set_navigate(name, path, true, false);
        }
    });
    views.bb_form_serch_page    = views.super_view.extend({
        el: "#body-desktop",
        name: "form_serch_page",
        initialize: function () {
            views.super_view.prototype.initialize.apply(this, arguments);
        },
        events: {

        }
    });
    views.bb_form_sales         = views.super_view.extend({
        /**
         * Форма создания/офармелния заказа
         */
        el: "#body-desktop",
        name: "form_sales",
        initialize : function(){
            views.super_view.prototype.initialize.apply(this, arguments);
            this.basket = views.basket;
        },
        events : {
            'click .btn-delete-basket' : 'btn_delete_basket'
        },
        /**
         * Удаленик номенклатуры из корзины
         * @param e
         */
        btn_delete_basket : function(e){
            let id = this.get_id(e);
            let param = [id];
            this.exec("delete_item_basket", param, function (_prm, data){
                try {
                        let json = JSON.parse(data);
                        if(json[0].res == 'ok') {
                            let _prm = [this.name, "basket"];
                            this.render(_prm);
                            //$("#bsk_list-"+_prm[2]).remove();
                            this.basket.render();
                        }
                    }
                    catch (e){
                        console.log(e);
                        console.log(data);

                    }

            });
        }

    });
    views.bb_form_cust         = views.super_view.extend({
        /**
         * Форма управлением клиентами пользователя
         */
        el: "#body-desktop",
        name: "form_cust"
    });



    //*************************GLOBAL FUNCTION************************************************/
    views.coll_view = new  collections.bb_coll_views();
    views.render = function (_param) {
        /**
         * Функция отрисовки формы
         */
        if (_param !== null) {

            views.param = _param.split("/");
            views.name = views.param[0];

            let view_model = views.coll_view.get(views.name);
            if(view_model == undefined){
                views.bb_view = views['bb_' + views.name];
                views.view = new views.bb_view();
                views.coll_view.add({id:views.name  ,form_object :  views.view});
            } else {
                views.view = view_model.get("form_object");

            }
            views.view.render(views.param);
        } else {
            //  console.log(views.param);
        }

    };
    //************************* INIT ************************************************/
    //views.basket = new views.bb_form_basket();
    new views.bb_form_login().render();
    new views.bb_navi_menu().render();
    new views.bb_navi_panel().render();
    new views.bb_form_serch();
   //views.basket.render();

    return views;
});
