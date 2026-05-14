import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from '../users/dto/login.dto'; // Reusing your DTO
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // POST: Admin Registration
  async registerAdmin(dto: CreateAdminDto) {
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingAdmin) throw new BadRequestException('Email already in use');

    // Force the role to be 'admin'
    return this.prisma.user.create({
      data: { ...dto, role: 'admin' },
    });
  }

  //  Admin Login  (Imp)
  async loginAdmin(dto: LoginDto) {
    const admin = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Strict check: Must exist, password must match, MUST be an admin
    if (!admin || admin.password !== dto.password || admin.role !== 'admin') {
      throw new UnauthorizedException('Invalid Admin credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async findAllAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  //
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  //
  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
