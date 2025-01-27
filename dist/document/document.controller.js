"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const document_service_1 = require("./document.service");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async sendTemplate(body) {
        try {
            const result = await this.documentsService.createSignatureRequest(body);
            return {
                message: 'Template sent successfully for signing!',
                document: result,
            };
        }
        catch (error) {
            console.error('Error in creating signature request:', error.message);
            throw new common_1.HttpException(`Failed to send template: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "sendTemplate", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [document_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=document.controller.js.map