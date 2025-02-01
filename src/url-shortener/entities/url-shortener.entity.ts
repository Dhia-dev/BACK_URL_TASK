import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
export class ShortenedUrl extends Document {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ShortenedUrlSchema = SchemaFactory.createForClass(ShortenedUrl);
