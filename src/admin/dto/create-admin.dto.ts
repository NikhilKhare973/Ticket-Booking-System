import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    example: 'Nikhil Admin',
    description: 'The full name of the admin',
  })
  name!: string;

  @ApiProperty({
    example: 'nikhil@Admin.com',
    description: 'A unique email address',
  })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'The user password',
  })
  password!: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role of the admin)',
    default: 'admin',
  })
  role!: string;
}
