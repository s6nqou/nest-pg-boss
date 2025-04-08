"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRetry = exports.getJobToken = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const logger = new common_1.Logger("PGBossModule");
function getJobToken(jobName) {
    return `JobService(${jobName})`;
}
exports.getJobToken = getJobToken;
function handleRetry(retryAttempts = 9, retryDelay = 3000, verboseRetryLog = false, toRetry) {
    return (source) => source.pipe((0, rxjs_1.retryWhen)((e) => e.pipe((0, rxjs_1.scan)((errorCount, error) => {
        if (toRetry && !toRetry(error)) {
            throw error;
        }
        const verboseMessage = verboseRetryLog
            ? ` Message: ${error.message}.`
            : "";
        logger.error(`Unable to connect to the database.${verboseMessage} Retrying (${errorCount + 1})...`, error.stack);
        if (errorCount + 1 >= retryAttempts) {
            throw error;
        }
        return errorCount + 1;
    }, 0), (0, rxjs_1.delay)(retryDelay))));
}
exports.handleRetry = handleRetry;
//# sourceMappingURL=utils.js.map