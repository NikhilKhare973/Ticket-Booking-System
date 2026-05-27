import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'nikhil@Admin2.com',
    description: 'The registered email',
  })
  email!: string;

  @ApiProperty({ example: '123456', description: 'The account password' })
  password!: string;
}
