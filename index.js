/**
 * 模拟requirejs写的文件本地模块关系管理器
 * @return {[type]} [description]
 */
(function(){

    var tool = {
        type: function(arg){
            return Object.prototype.toString.call(arg).substr(8,5).toLowerCase();
        }
    }

    var _modules = {
            /*require: function(name){
                return _modules[name];
            }*/
        },
        _unInitModules = {},
        // 加载本模块时，其依赖的模块还没有加载完
        depUnloadModules = {},
        // 本模块被其他模块依赖时，本模块还没加载
        unloadModulesByDep = {}



    //window.require = _modules.require;

    window.define = function(name, deps, fn){
        var args = [],
            unloads,
            beUnloads;
        if(tool.type(deps)!=='array'){
            fn = deps;
            deps = null;
        }
        if(deps){
            deps.forEach(function(dep){
                if(!_modules[dep]){
                if(!unloads){
                        depUnloadModules[name] = unloads=[];
                    }
                    if(!unloadModulesByDep[dep]){
                        unloadModulesByDep[dep] = [];
                    }
                    beUnloads = unloadModulesByDep[dep];
                    unloads.push(dep);
                    beUnloads.push(name);
                }else{
                     args.push(_modules[dep]);
                }
            });
        }
        if(!unloads){
            _modules[name] = fn?fn.apply(fn, args):{};

            // 本模块在加载前被其他模块依赖过
            if(unloadModulesByDep[name]){
                unloadModulesByDep[name].forEach(function(moduleName){
                    depModule = depUnloadModules[moduleName];
                    depModule.splice( depModule.indexOf(name),1 );
                    if(depModule.length===0){
                        var data = _unInitModules[moduleName];
                        define(moduleName, data.deps, data.fn);
                        delete _unInitModules[moduleName];
                        delete depUnloadModules[moduleName];
                    }
                });
                delete unloadModulesByDep[name];
            }
        }else{
            _unInitModules[name] = {
                deps: deps,
                fn: fn
            };
        }
    }

})();
