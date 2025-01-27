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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./document.entity");
const schedule_1 = require("@nestjs/schedule");
let DocumentsService = class DocumentsService {
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
        this.DROPBOX_SIGN_API_URL = 'https://api.hellosign.com/v3';
    }
    getAuthHeaders() {
        return {
            Authorization: `Basic ${Buffer.from(process.env.DROPBOX_SIGN_API_KEY + ':').toString('base64')}`,
        };
    }
    async createSignatureRequest(data) {
        try {
            const { templateId, participants } = data;
            const signers = participants.map((participant) => ({
                role: participant.role,
                email_address: participant.email.trim(),
                name: participant.name.trim(),
            }));
            const payload = {
                template_id: templateId,
                subject: 'Rooftop air rights and purchase agreement',
                message: 'Glad we could come to an agreement.',
                signingOptions: { draw: true, type: true, upload: true, defaultType: 'draw' },
                signers,
                ccs: [],
                test_mode: 1,
            };
            const response = await axios_1.default.post(`${this.DROPBOX_SIGN_API_URL}/signature_request/send_with_template`, payload, { headers: { ...this.getAuthHeaders() } });
            const signatureRequestId = response.data.signature_request.signature_request_id;
            const newDocument = this.documentRepository.create({
                templateId,
                participants,
                signatureRequestId,
                status: document_entity_1.DocumentStatus.Pending,
            });
            return this.documentRepository.save(newDocument);
        }
        catch (error) {
            console.error('Error creating signature request:', error.response?.data || error.message);
            throw new Error(`Failed to create signature request: ${error.message}`);
        }
    }
    async pollSignatureRequestStatus() {
        try {
            const pendingDocuments = await this.documentRepository.find({
                where: { status: document_entity_1.DocumentStatus.Pending },
            });
            for (const document of pendingDocuments) {
                try {
                    console.log(`Checking status for Document ID: ${document.id}, SignatureRequestID: ${document.signatureRequestId}`);
                    const url = `${this.DROPBOX_SIGN_API_URL}/signature_request/${document.signatureRequestId}`;
                    const response = await axios_1.default.get(url, {
                        headers: this.getAuthHeaders(),
                    });
                    const signatureRequest = response.data.signature_request;
                    if (signatureRequest.is_complete) {
                        document.status = document_entity_1.DocumentStatus.Signed;
                        console.log(`Document ID ${document.id} marked as Signed.`);
                    }
                    else if (signatureRequest.has_been_viewed) {
                        document.status = document_entity_1.DocumentStatus.Viewed;
                        console.log(`Document ID ${document.id} marked as Viewed.`);
                    }
                    await this.documentRepository.save(document);
                }
                catch (docError) {
                    console.error(`Error fetching status for Document ID ${document.id}:`, docError.response?.data || docError.message);
                }
            }
        }
        catch (error) {
            console.error('Error polling signature request status:', error.response?.data || error.message);
        }
    }
    async runPollingTask() {
        console.log('Running document status polling task...');
        await this.pollSignatureRequestStatus();
    }
};
exports.DocumentsService = DocumentsService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentsService.prototype, "runPollingTask", null);
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DocumentsService);
//# sourceMappingURL=document.service.js.map