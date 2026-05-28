import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    const newUser = await this.prisma.user.create({
      data: data,
    });

    return newUser;
  }

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'User',
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: data,
    });

    return updatedUser;
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  // Register user
  async registerUser(dto: CreateUserDto) {
    // email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // create user
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: 'User',
      },
    });

    return newUser;
  }

  async loginUser(dto: LoginDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password !== dto.password) {
      throw new UnauthorizedException('Wrong password');
    }

    if (user.role !== 'User') {
      throw new UnauthorizedException('Not a user');
    }

    // create jwt payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // generate token
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}
