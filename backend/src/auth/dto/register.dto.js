"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
var class_validator_1 = require("class-validator");
var usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var RegisterDto = function () {
    var _a;
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _correo_decorators;
    var _correo_initializers = [];
    var _correo_extraInitializers = [];
    var _contrasena_decorators;
    var _contrasena_initializers = [];
    var _contrasena_extraInitializers = [];
    var _telefono_decorators;
    var _telefono_initializers = [];
    var _telefono_extraInitializers = [];
    var _rol_decorators;
    var _rol_initializers = [];
    var _rol_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RegisterDto() {
                this.nombre = __runInitializers(this, _nombre_initializers, void 0);
                this.correo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _correo_initializers, void 0));
                this.contrasena = (__runInitializers(this, _correo_extraInitializers), __runInitializers(this, _contrasena_initializers, void 0));
                this.telefono = (__runInitializers(this, _contrasena_extraInitializers), __runInitializers(this, _telefono_initializers, void 0));
                this.rol = (__runInitializers(this, _telefono_extraInitializers), __runInitializers(this, _rol_initializers, void 0));
                __runInitializers(this, _rol_extraInitializers);
            }
            return RegisterDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [(0, class_validator_1.IsString)()];
            _correo_decorators = [(0, class_validator_1.IsEmail)({}, { message: 'El correo no es válido' })];
            _contrasena_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(6, { message: 'La contraseña debe tener al menos 6 caracteres' })];
            _telefono_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _rol_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(usuario_entity_1.Rol)];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _correo_decorators, { kind: "field", name: "correo", static: false, private: false, access: { has: function (obj) { return "correo" in obj; }, get: function (obj) { return obj.correo; }, set: function (obj, value) { obj.correo = value; } }, metadata: _metadata }, _correo_initializers, _correo_extraInitializers);
            __esDecorate(null, null, _contrasena_decorators, { kind: "field", name: "contrasena", static: false, private: false, access: { has: function (obj) { return "contrasena" in obj; }, get: function (obj) { return obj.contrasena; }, set: function (obj, value) { obj.contrasena = value; } }, metadata: _metadata }, _contrasena_initializers, _contrasena_extraInitializers);
            __esDecorate(null, null, _telefono_decorators, { kind: "field", name: "telefono", static: false, private: false, access: { has: function (obj) { return "telefono" in obj; }, get: function (obj) { return obj.telefono; }, set: function (obj, value) { obj.telefono = value; } }, metadata: _metadata }, _telefono_initializers, _telefono_extraInitializers);
            __esDecorate(null, null, _rol_decorators, { kind: "field", name: "rol", static: false, private: false, access: { has: function (obj) { return "rol" in obj; }, get: function (obj) { return obj.rol; }, set: function (obj, value) { obj.rol = value; } }, metadata: _metadata }, _rol_initializers, _rol_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RegisterDto = RegisterDto;
