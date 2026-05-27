import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeatsService {
  constructor(private prismaService: PrismaService) {}

  async create(createSeatDto: CreateSeatDto) {
    const newSeat = await this.prismaService.seat.create({
      data: createSeatDto,
    });

    return newSeat;
  }

  async findAll() {
    const seats = await this.prismaService.seat.findMany({
      include: {
        event: true,
      },
    });

    return seats;
  }

  async findOne(id: number) {
    const seat = await this.prismaService.seat.findUnique({
      where: {
        id: id,
      },
      include: {
        event: true,
      },
    });

    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    return seat;
  }

  async update(id: number, updateSeatDto: UpdateSeatDto) {
    const updatedSeat = await this.prismaService.seat.update({
      where: {
        id: id,
      },
      data: updateSeatDto,
    });

    return updatedSeat;
  }

  async remove(id: number) {
    await this.prismaService.seat.delete({
      where: {
        id: id,
      },
    });

    return {
      message: `Seat #${id} successfully deleted`,
    };
  }
}
