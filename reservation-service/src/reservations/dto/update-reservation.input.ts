import { InputType, Field, Int } from "@nestjs/graphql";
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsInt,
  IsNotEmpty,
  Min,
} from "class-validator";

@InputType()
export class UpdateReservationInput {
  @Field(() => Int, { description: "Optimistic lock version (required)" })
  @IsNotEmpty()
  @IsInt()
  version!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  expectedArrival?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  tableSize?: number;
}
