define([
    "jwebkit",
    "jwebkit.ui",
], function(jwk) {
    
    var $ = jwk.query;
    var Component = jwk.ui.Component;
    
    // Emboss --------------------------------------------------------------------------
    PackView = function (settings) {
        if (!settings) return;
        var def = jwk.ui.component("jwebdesk", "package.view").defaults();
        sett = jwk.extend(def, settings);
        jwk.ui.Component.call(this, sett);
        
    }
    
    var install_package = function (package) {
        return jwebdesk.wait_service("package-manager").done(function(manager) {
            return manager.install(package);
        });
    }

    var uninstall_package = function (package) {
        return jwebdesk.wait_service("package-manager").done(function(manager) {
            return manager.uninstall(package);
        });
    } 
    
    
    jwk.ui.component({
        ui_type: "package.view",
        namespace: "jwebdesk",
        defaults: {
            "template": {
                "visibility": "style='{{^self.value}}display: none;{{/self.value}}'",
                "main": "<div {{>visibility}}>  </div>"
            }
        },

        api: {
            parent_for: function (name, index) { return {parent:this}; },
            structure_tree: function () {
                var comp = this;
                var installed = false || (this.value && this.value.get("installed"));
                this.on("change:structure", function (n, e) {
                    var structure = e.value;
                    
                    // ------------------------------------------------------
                    // Esto es porque agregar un listener no borra el anterior.
                    // Hay que sacar el anterior a manopla. Esto puede provocar que otro listener previamente agregado sea descartado sin aviso (OJO!)
                    // Igual esto ya está resuelto en jwebkit
                    structure.search("btn_open_app").off("click");
                    structure.search("btn_install").off("click");
                    structure.search("btn_uninstall").off("click");
                    structure.search("btn_clone_package").off("click");
                    // ------------------------------------------------------
                    
                    structure.search("btn_open_app").on("click", function (n,e) {
                        console.log('structure.search("btn_open_app")');
                        jwebdesk.open_app(comp.value.get("path"));
                    });
                    structure.search("btn_install").on("click", function (n,e) {
                        install_package(comp.value.get("path")).done(function () {
                            comp.value.set("installed", true);
                            comp.value.set("not_installed", false);
                            comp.trigger_fast("change:value.installed", { value: true, target: comp.owner, path: "value.installed" });
                            comp.trigger_fast("change:value.not_installed", { value: false, target: comp.owner, path: "value.not_installed" });
                        });
                    });
                    structure.search("btn_uninstall").on("click", function (n,e) {
                        uninstall_package(comp.value.get("path")).done(function () {
                            comp.value.set("installed", false);
                            comp.value.set("not_installed", true);
                            comp.trigger_fast("change:value.installed", { value: false, target: comp.owner, path: "value.installed" });
                            comp.trigger_fast("change:value.not_installed", { value: true, target: comp.owner, path: "value.not_installed" });
                        });
                    });
                    structure.search("btn_clone_package").on("click", function (n,e) {
                    });
                });
                
                if (this.value) {
                    this.value.set("not_installed", !this.value.get("installed"));
                    this.value.set("installed", !this.value.get("not_installed")); // esto es porque installed puede venir undefined != false
                    this.value.set("is_runnable", this.value.get("type") == "setup");
                    this.value.set("has_repository", !!this.value.has("repository"));
                    
                    switch (this.value.get("state")) {
                        case "prod": this.value.set("state_display", "production"); break;
                        case "debug": this.value.set("state_display", "debugging"); break;
                        case "dev": this.value.set("state_display", "development"); break;                        
                    }
                    
                    console.log(this.value.valueOf());
                }
                
                
                
                return {                    
                    "start": "col",
                    "layout": ["p_top", ["p_left", "p_right"], "p_buttons"],
                    "ui_type": "panel.layout",
                    "class": "expand_",
                    "children": {
                        "p_top": {
                            "class": "expand",
                            "ui_type": "panel",                            
                            "children": {
                                "image": {
                                    "ui_type": "panel.image",
                                    "url": "<<owner.value.icon>>"                                                
                                },
                                "title": {
                                    "ui_type": "label",
                                    "class": "title",
                                    "text": "<<owner.value.name>>"                                                
                                }                                
                            }
                        },
                        "p_left": {
                            "class": "expand",
                            "ui_type": "panel.inset",
                            "children": {                                
                                "tabla": {
                                    "class": "expand",
                                    "ui_type": "panel.table",
                                    "cols": 4,
                                    "children": {
                                        "A1": { "class": "bold", "ui_type": "label", "text": "Name:" },
                                        "A2": { "ui_type": "label", "text": "<<owner.value.name>>" },
                                        "B1": { "class": "bold", "ui_type": "label", "text": "Type:" },
                                        "B2": { "ui_type": "label", "text": "<<owner.value.type>>" },
                                        "A3": { "class": "bold", "ui_type": "label", "text": "Version:" },
                                        "A4": { "ui_type": "label", "text": "<<owner.value.version>>" },
                                        "B3": { "class": "bold", "ui_type": "label", "text": "Code:" },
                                        "B4": { "ui_type": "label", "text": "<<owner.value.codetype>>" },
                                        "A5": { "class": "bold", "ui_type": "label", "text": "Owner:" },
                                        "A6": { "ui_type": "label", "text": "<<owner.value.owner>>" },
                                        "B5": { "class": "bold", "ui_type": "label", "text": "State:" },
                                        "B6": { "ui_type": "label", "text": "<<owner.value.state_display>>" },
                                    }
                                }
                            }
                        },
                        "p_right": {
                            "class": "expand",
                            "ui_type": "panel.inset",
                            "renderize": "<<owner.value.has_repository>>",
                            "children": {
                                "tabla": {
                                    "class": "expand",
                                    "ui_type": "panel.table",
                                    "children": {
                                        "A1": { "class": "bold", "ui_type": "label", "text": "Repository:" },
                                        "A2": {
                                            "ui_type": "label.link",
                                            "text": "<<owner.value.repository.url>>",
                                            "url": "<<owner.value.repository.url>>",
                                            "openin": "_blank"
                                        },
                                        "A3": { "class": "bold", "ui_type": "label", "text": "Branch:" },
                                        "A4": { "ui_type": "label", "text": "<<owner.value.repository.branch>>" },
                                        "A5": { "class": "bold", "ui_type": "label", "text": "Commit:" },
                                        "A6": { "ui_type": "label", "text": "<<owner.value.repository.SHA>>" }
                                    }
                                }
                            }
                        },
                        "p_buttons": {
                            "ui_type": "panel.inset",
                            "children": {
                                "btn_open_app": {
                                    "ui_type": "button",
                                    "text": "Open App",
                                    "renderize": "<<owner.value.is_runnable>>"
                                },
                                "btn_uninstall": {
                                    "ui_type": "button",
                                    "text": "Uninstall",
                                    "renderize": "<<owner.value.installed>>"
                                },
                                "btn_install": {
                                    "ui_type": "button",
                                    "text": "Install",
                                    "renderize": "<<owner.value.not_installed>>"
                                },
                                "btn_clone_package": {
                                    "ui_type": "button",
                                    "text": "Clone Package"
                                }                                                        
                            }
                        }                                
                    }
                };
            }
        },
        constructor: PackView,
        extends: jwk.ui.Component
    });
   
    return PackView;
});