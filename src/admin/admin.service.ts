import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from '../users/dto/login.dto';
import { UpdateAdminDto } from './dto/update-admin-dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Register new admin
  async registerAdmin(dto: CreateAdminDto) {
    // check if email already exists
    const adminExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (adminExists) {
      throw new BadRequestException('Email already exists');
    }

    // create admin
    const newAdmin = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: 'Admin',
      },
    });

    return newAdmin;
  }

  async loginAdmin(dto: LoginDto) {
    // find admin by email
    const admin = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // check
    if (admin.password !== dto.password) {
      throw new UnauthorizedException('Wrong password');
    }

    if (admin.role !== 'Admin') {
      throw new UnauthorizedException('Not an admin');
    }

    // create jwt token
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }

  async findAllAdmins() {
    const admins = await this.prisma.user.findMany({
      where: {
        role: 'Admin',
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return admins;
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

  async update(id: number, data: UpdateAdminDto) {
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
}

// make this code look like beginner write it ,
// just make beginner friendly code, and functionality not change(importent )
