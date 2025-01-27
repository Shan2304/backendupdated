declare class Participant {
    role: string;
    name: string;
    email: string;
}
export declare class CreateDocumentDto {
    templateId: string;
    participants: Participant[];
}
export {};
