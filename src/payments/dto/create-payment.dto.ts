import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'The ID of the booking' })
  bookingId!: number;

  @ApiProperty({ example: 500, description: 'The total amount in INR' })
  amount!: number;
}
