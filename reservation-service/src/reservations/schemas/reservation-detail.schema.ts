import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Field, ObjectType, ID } from "@nestjs/graphql";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
@ObjectType()
export class ReservationDetail extends Document {
  @Field(() => ID)
  _id!: string;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  @Field(() => String, { description: "Associated reservation ID" })
  reservationId!: string;

  @Prop({ required: false })
  @Field({
    nullable: true,
    description: "Seating preference (e.g. window, patio)",
  })
  seatingPreference?: string;

  @Prop({ required: false })
  @Field({
    nullable: true,
    description: "Special occasion (e.g. birthday, anniversary)",
  })
  occasion?: string;

  @Prop({ required: false })
  @Field({
    nullable: true,
    description: "Dietary requirements (e.g. vegetarian, gluten-free)",
  })
  dietaryRequirements?: string;

  @Prop({ required: false })
  @Field({
    nullable: true,
    description: "Additional notes or special requests",
  })
  specialRequests?: string;
}

export const ReservationDetailSchema =
  SchemaFactory.createForClass(ReservationDetail);
