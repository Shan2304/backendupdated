import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DocumentsService {
  private readonly DROPBOX_SIGN_API_URL = 'https://api.hellosign.com/v3';

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  private getAuthHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(
        process.env.DROPBOX_SIGN_API_KEY + ':'
      ).toString('base64')}`,
    };
  }

  async createSignatureRequest(data: any) {
    try {
      const { templateId, participants } = data;
  
      // Map participants to signers with signing order
      const signers = participants.map((participant, index) => ({
        role: participant.role, // SELLER or BUYER
        email_address: participant.email.trim(),
        name: participant.name.trim(),
        order: index + 1, // Signing order: 1 = SELLER, 2 = BUYER
      }));
  
      const payload = {
        template_id: templateId,
        subject: 'Rooftop air rights and purchase agreement',
        message: 'Glad we could come to an agreement.',
        signingOptions: { draw: true, type: true, upload: true, defaultType: 'draw' },
        signers,
        ccs: [], // Add CC emails if needed
        test_mode: 1, // Set to 1 for test mode
      };

      console.log("final payload" , payload)
  
      const response = await axios.post(
        `${this.DROPBOX_SIGN_API_URL}/signature_request/send_with_template`,
        payload,
        { headers: { ...this.getAuthHeaders() } },
      );
  
      const signatureRequestId = response.data.signature_request.signature_request_id;
  
      const newDocument = this.documentRepository.create({
        templateId,
        participants,
        signatureRequestId,
        status: DocumentStatus.Pending,
      });
  
      return this.documentRepository.save(newDocument);
    } catch (error) {
      console.error(
        'Error creating signature request:',
        error.response?.data || error.message,
      );
      throw new Error(`Failed to create signature request: ${error.message}`);
    }
  }
  
  async pollSignatureRequestStatus() {
    try {
      const pendingDocuments = await this.documentRepository.find({
        where: { status: DocumentStatus.Pending },
      });

      for (const document of pendingDocuments) {
        try {
          console.log(`Checking status for Document ID: ${document.id}, SignatureRequestID: ${document.signatureRequestId}`);

          const url = `${this.DROPBOX_SIGN_API_URL}/signature_request/${document.signatureRequestId}`;
          const response = await axios.get(url, {
            headers: this.getAuthHeaders(),
          });

          const signatureRequest = response.data.signature_request;

          if (signatureRequest.is_complete) {
            document.status = DocumentStatus.Signed;
            console.log(`Document ID ${document.id} marked as Signed.`);
          } else if (signatureRequest.has_been_viewed) {
            document.status = DocumentStatus.Viewed;
            console.log(`Document ID ${document.id} marked as Viewed.`);
          }

          await this.documentRepository.save(document);
        } catch (docError) {
          console.error(
            `Error fetching status for Document ID ${document.id}:`,
            docError.response?.data || docError.message,
          );
        }
      }
    } catch (error) {
      console.error('Error polling signature request status:', error.response?.data || error.message);
    }
  }

  @Cron('*/5 * * * *') // Runs every 5 minutes
  async runPollingTask() {
    console.log('Running document status polling task...');
    await this.pollSignatureRequestStatus();
  }
}
