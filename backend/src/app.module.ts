import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.COSMOS_MONGO_URI || 'mongodb://localhost:27017/hilton_reservations'),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: process.env.GRAPHQL_PLAYGROUND === 'true',
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    ReservationsModule,
  ],
})
export class AppModule {}
