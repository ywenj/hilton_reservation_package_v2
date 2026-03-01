import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Field, ObjectType, ID, Int, registerEnumType } from "@nestjs/graphql";
import { Document } from "mongoose";

export enum ReservationStatus {
  Requested = "Requested",
  Approved = "Approved",
  Completed = "Completed",
  Cancelled = "Cancelled",
}
registerEnumType(ReservationStatus, { name: "ReservationStatus" });

@Schema({ timestamps: true, optimisticConcurrency: true })
@ObjectType()
export class Reservation extends Document {
  @Field(() => ID)
  _id!: string;

  @Field(() => Int, { name: "version", description: "Optimistic lock version" })
  __v!: number;

  @Prop({ required: false, index: true })
  @Field({ nullable: true, description: "Owner user id (JWT sub)" })
  userId?: string;

  @Prop({ required: true })
  @Field()
  guestName!: string;

  @Prop({ required: true })
  @Field()
  contactPhone!: string;

  @Prop()
  @Field({ nullable: true })
  contactEmail?: string;

  @Prop({ required: true })
  @Field()
  expectedArrival!: string; // ISO string

  @Prop({ required: true, min: 1 })
  @Field(() => Int)
  tableSize!: number;

  @Prop({
    required: true,
    enum: ReservationStatus,
    default: ReservationStatus.Requested,
  })
  @Field(() => ReservationStatus)
  status!: ReservationStatus;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
