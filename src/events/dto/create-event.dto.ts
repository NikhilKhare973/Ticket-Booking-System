import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Avengers: Endgame',
    description: 'Title of the event',
  })
  title!: string;

  @ApiProperty({ example: 300, description: 'Price of the ticket' })
  price!: number;

  @ApiProperty({
    example: '2026-05-01T18:00:00Z',
    description: 'Date and time',
  })
  date!: string;

  @ApiProperty({ example: 1, description: 'ID of the Admin creating this' })
  adminId!: number;

  @ApiProperty({
    example: 5,
    description: 'Number of rows (e.g., 5 means rows A through E)',
  })
  rows!: number;

  @ApiProperty({
    example: 10,
    description: 'Seats per row (e.g., 10 means seats 1 through 10)',
  })
  seatsPerRow!: number;
}
