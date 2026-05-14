import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  // POST--> Create a new seat
  async create(createSeatDto: CreateSeatDto) {
    return this.prisma.seat.create({
      data: createSeatDto,
    });
  }

  // GET--> Find all seats (and show which event they belong to!)
  async findAll() {
    return this.prisma.seat.findMany({
      include: { event: true },
    });
  }

  // GET--> Find one seat
  async findOne(id: number) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!seat) throw new NotFoundException(`Seat #${id} not found`);
    return seat;
  }

  // PATCH--> Update a seat (e.g., changing status to "booked")
  async update(id: number, updateSeatDto: UpdateSeatDto) {
    return this.prisma.seat.update({
      where: { id },
      data: updateSeatDto,
    });
  }
  // DELETE--> Remove a seat
  async remove(id: number) {
    await this.prisma.seat.delete({ where: { id } });
    return { message: `Seat #${id} successfully deleted` };
  }
}
