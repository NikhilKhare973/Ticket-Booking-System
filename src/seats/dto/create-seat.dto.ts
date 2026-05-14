import { ApiProperty } from '@nestjs/swagger';

export class CreateSeatDto {
  @ApiProperty({
    example: 'A1',
    description: 'The specific seat number or label',
  })
  seatNo!: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the event this seat belongs to',
  })
  eventId!: number;
}
