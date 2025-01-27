import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DocumentStatus {
  Pending = 'Pending',
  Viewed = 'Viewed',
  Signed = 'Signed',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: string;

  @Column('jsonb')
  participants: { role: string; name: string; email: string }[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.Pending,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  signatureRequestId: string;
}