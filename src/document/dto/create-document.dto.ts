import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Participant {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Participant)
  participants: Participant[];
}
