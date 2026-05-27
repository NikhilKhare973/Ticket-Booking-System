import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateBookingDto) {
    // Check seat limit
    if (dto.seatIds.length > 5) {
      throw new BadRequestException(
        'You can only book maximum 5 seats at one time.',
      );
    }

    if (dto.seatIds.length === 0) {
      throw new BadRequestException('Please select at least one seat.');
    }

    // Find seats from database
    const seats = await this.prismaService.seat.findMany({
      where: {
        id: {
          in: dto.seatIds,
        },
      },
    });

    if (seats.length !== dto.seatIds.length) {
      throw new BadRequestException('Some selected seats do not exist.');
    }

    // seats are already booked
    const bookedSeats = seats.filter((seat) => {
      return seat.status !== 'available';
    });

    if (bookedSeats.length > 0) {
      const bookedSeatNumbers = bookedSeats
        .map((seat) => {
          return seat.seatNo;
        })
        .join(', ');

      throw new BadRequestException(
        `These seats are already booked: ${bookedSeatNumbers}`,
      );
    }

    // Transaction starts here - update seat status and create booking records
    return this.prismaService.$transaction(async (prisma) => {
      // Update seats status
      await prisma.seat.updateMany({
        where: {
          id: {
            in: dto.seatIds,
          },
        },
        data: {
          status: 'booked',
        },
      });

      // Create booking data
      const bookingData = dto.seatIds.map((seatId) => {
        return {
          userId: dto.userId,
          eventId: dto.eventId,
          seatId: seatId,
        };
      });

      // Save bookings
      await prisma.booking.createMany({
        data: bookingData,
      });

      return {
        message: `Success! You booked ${dto.seatIds.length} seats.`,
      };
    });
  }

  async findAll() {
    const bookings = await this.prismaService.booking.findMany({
      include: {
        user: true,
        event: true,
        seat: true,
      },
    });

    return bookings;
  }

  async findOne(id: number) {
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        event: true,
        seat: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }

    return booking;
  }

  async update(id: number, updateBookingDto: any) {
    const updatedBooking = await this.prismaService.booking.update({
      where: {
        id: id,
      },
      data: updateBookingDto,
    });

    return updatedBooking;
  }

  async remove(id: number) {
    const booking = await this.findOne(id);

    // Make seat available again
    await this.prismaService.seat.update({
      where: {
        id: booking.seatId,
      },
      data: {
        status: 'available',
      },
    });

    await this.prismaService.booking.delete({
      where: {
        id: id,
      },
    });

    return {
      message: `Booking #${id} successfully cancelled`,
    };
  }

  async findByUserEmail(email: string) {
    // Find bookings using email
    const userBookings = await this.prismaService.booking.findMany({
      where: {
        user: {
          email: email,
        },
      },

      include: {
        user: true,
        event: true,
        seat: true,
        payment: true,
      },
    });

    if (userBookings.length === 0) {
      throw new NotFoundException(`No tickets found for email: ${email}`);
    }

    // Format response
    const formattedBookings = userBookings.map((booking) => {
      return {
        ticketId: `TICKET-${booking.id}`,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        movieOrEvent: booking.event.title,
        showTime: booking.event.date,
        seatNumber: booking.seat.seatNo,

        amountPaid: booking.payment?.amount || 'Pending',
        paymentStatus: booking.payment?.status || 'No Payment Record',
      };
    });

    return formattedBookings;
  }
}
