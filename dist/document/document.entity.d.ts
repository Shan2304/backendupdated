export declare enum DocumentStatus {
    Pending = "Pending",
    Viewed = "Viewed",
    Signed = "Signed"
}
export declare class Document {
    id: number;
    templateId: string;
    participants: {
        role: string;
        name: string;
        email: string;
    }[];
    createdAt: Date;
    status: DocumentStatus;
    signatureRequestId: string;
}
