import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'Nikhil Khare',
    description: 'The full name of the user',
  })
  name!: string;

  @ApiProperty({
    example: 'nikhil@user1.com',
    description: 'A unique email address',
  })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'The user password',
  })
  password!: string;

  @ApiProperty({
    example: 'user',
    description: 'Role of the user (user or admin)',
    default: 'user',
  })
  role!: Role;
}
