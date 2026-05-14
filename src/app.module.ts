import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { SeatsModule } from './seats/seats.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';

import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Make JWT available to every folder in the app
    JwtModule.register({
      global: true,
      secret: 'MY_SUPER_SECRET_KEY_123',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    EventsModule,
    SeatsModule,
    BookingsModule,
    PaymentsModule,

    AdminModule,
  ], // Notice TypeOrm is completely gone!
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
