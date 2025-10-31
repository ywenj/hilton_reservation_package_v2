import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ default: "guest" })
  role!: string;

  @Prop({ trim: true, lowercase: true, sparse: true, unique: true })
  email?: string;

  @Prop({ trim: true, sparse: true, unique: true })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
