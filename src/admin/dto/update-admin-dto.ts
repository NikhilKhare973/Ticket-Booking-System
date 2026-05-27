import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiProperty({
    example: 'Nikhil Admin1',
    description: 'The full name of the admin',
  })
  name!: string;

  @ApiProperty({
    example: 'nikhil@Admin1.com',
    description: 'A unique email address',
  })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'The user password',
  })
  password!: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role of the admin)',
    default: 'admin',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Change 'string' to 'Role'
}
