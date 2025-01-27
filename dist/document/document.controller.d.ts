import { DocumentsService } from './document.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    sendTemplate(body: any): Promise<{
        message: string;
        document: import("./document.entity").Document;
    }>;
}
