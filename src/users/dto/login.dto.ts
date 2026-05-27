import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'nikhil@user1.com',
  })
  email!: string;

  @ApiProperty({ example: '123456' })
  password!: string;
}
