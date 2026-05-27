import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({
    example: 'Taylor Swift Concert',
    description: 'Title of the event',
  })
  title!: string;

  @ApiProperty({ example: 300, description: 'Price of the ticket' })
  price!: number;

  @ApiProperty({
    example: '2026-12-31T20:00:00Z',
    description: 'Date and time',
  })
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @ApiProperty({ example: 2, description: 'ID of the Admin creating this' })
  adminId!: number;

  @ApiProperty({
    example: 3,
    description: 'Number of rows (e.g., 5 means rows A through E)',
  })
  rows!: number;

  @ApiProperty({
    example: 5,
    description: 'Seats per row (e.g., 5 means seats 1 through 5)',
  })
  seatsPerRow!: number;
}
