import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'The ID of the booking' })
  bookingId!: number;

  @ApiProperty({ example: 5000, description: 'The total amount in INR' })
  amount!: number;
}
