import { Repository } from 'typeorm';
import { Document } from './document.entity';
export declare class DocumentsService {
    private readonly documentRepository;
    private readonly DROPBOX_SIGN_API_URL;
    constructor(documentRepository: Repository<Document>);
    private getAuthHeaders;
    createSignatureRequest(data: any): Promise<Document>;
    pollSignatureRequestStatus(): Promise<void>;
    runPollingTask(): Promise<void>;
}
