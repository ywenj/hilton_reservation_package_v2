import { InputType, Field, Int } from "@nestjs/graphql";
import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from "class-validator";

@InputType()
export class CreateReservationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  guestName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  contactPhone!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @Field()
  @IsNotEmpty()
  @IsISO8601()
  expectedArrival!: string; // ISO date string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  tableSize!: number;
}
