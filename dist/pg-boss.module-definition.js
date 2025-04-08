"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONS_TYPE = exports.MODULE_OPTIONS_TOKEN = exports.ConfigurableModuleClass = void 0;
const common_1 = require("@nestjs/common");
const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE, } = new common_1.ConfigurableModuleBuilder()
    .setClassMethodName("forRoot")
    .build();
exports.ConfigurableModuleClass = ConfigurableModuleClass;
exports.MODULE_OPTIONS_TOKEN = MODULE_OPTIONS_TOKEN;
exports.OPTIONS_TYPE = OPTIONS_TYPE;
//# sourceMappingURL=pg-boss.module-definition.js.map