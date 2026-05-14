import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'The ID of the User' })
  userId!: number;

  @ApiProperty({ example: 5, description: 'The ID of the Event' })
  eventId!: number;

  // Notice the brackets [Number] and number[] - this makes it an array!
  @ApiProperty({
    type: [Number],
    example: [16, 17, 18],
    description: 'Array of Seat IDs (Max 5)',
  })
  seatIds!: number[];
}
