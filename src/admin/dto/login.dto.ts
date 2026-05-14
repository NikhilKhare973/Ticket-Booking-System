import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'nikhil@Admin.com',
    description: 'The registered email',
  })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'The account password' })
  password!: string;
}
