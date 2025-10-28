import { InputType, Field, Int } from '@nestjs/graphql';
import { IsISO8601, IsOptional, IsString, IsInt, Min } from 'class-validator';

@InputType()
export class UpdateReservationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string;

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
