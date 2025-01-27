import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './document.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async sendTemplate(@Body() body: any) {
    try {
      const result = await this.documentsService.createSignatureRequest(body);
      return {
        message: 'Template sent successfully for signing!',
        document: result,
      };
    } catch (error) {
      console.error('Error in creating signature request:', error.message);
      throw new HttpException(
        `Failed to send template: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
