import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'The ID of the User' })
  userId!: number;

  @ApiProperty({ example: 1, description: 'The ID of the Event' })
  eventId!: number;

  @ApiProperty({
    type: [Number],
    example: [16, 17, 18],
    description: 'Array of Seat IDs (Max 5)',
  })
  seatIds!: number[];
}
