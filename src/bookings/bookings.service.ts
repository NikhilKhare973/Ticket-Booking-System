import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // POST: Create multiple bookings at once
  async create(dto: CreateBookingDto) {
    // ---> 1.Enforce the limit rule (you can only book up to 5 seats at a time) <-----
    if (dto.seatIds.length > 5) {
      throw new BadRequestException(
        'You can only book a maximum of 5 seats at a time.',
      );
    }
    if (dto.seatIds.length === 0) {
      throw new BadRequestException(
        'Please select at least one seat to decrementook.',
      );
    }

    // 2. Fetch all requested seats to make sure they exist
    const seats = await this.prisma.seat.findMany({
      where: { id: { in: dto.seatIds } },
    });

    if (seats.length !== dto.seatIds.length) {
      throw new BadRequestException(
        'One or more selected seats do not exist in the database.',
      );
    }

    // -----> 3.Check if any of them are already booked by someone else! <-----
    const unavailableSeats = seats.filter(
      (seat) => seat.status !== 'available',
    );
    if (unavailableSeats.length > 0) {
      const badSeatNumbers = unavailableSeats.map((s) => s.seatNo).join(', ');
      throw new BadRequestException(
        `Sorry, the following seats are already booked: ${badSeatNumbers}`,
      );
    }

    // -----> 4.The Database Transaction (All or Nothing!) <-----
    // This safely updates the seats AND creates the booking records simultaneously
    return this.prisma.$transaction(async (prisma) => {
      //  *** A. Mark the seats as 'booked' ***
      await prisma.seat.updateMany({
        where: { id: { in: dto.seatIds } },
        data: { status: 'booked' },
      });

      // ***B. Create a booking receipt for each seat ***
      const bookingData = dto.seatIds.map((seatId) => ({
        userId: dto.userId,
        eventId: dto.eventId,
        seatId: seatId,
      }));

      await prisma.booking.createMany({
        data: bookingData,
      });

      return {
        message: `Success! You have booked ${dto.seatIds.length} seats.`,
      };
    });
  }

  // GET ---> Find all bookings (include the user, event, and seat details)
  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        event: true,
        seat: true,
      },
    });
  }

  // GET -> Find a specific booking
  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { user: true, event: true, seat: true },
    });
    if (!booking) throw new NotFoundException(`Booking #${id} not found`);
    return booking;
  }

  // PATCH -> Update a booking (e.g., changing the user or seat)
  async update(id: number, updateBookingDto: any) {
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    });
  }

  // DELETE -> Cancel a booking
  async remove(id: number) {
    //1. Find the booking to get the seat ID
    const booking = await this.findOne(id);

    // 2.Make the seat "available" again!
    await this.prisma.seat.update({
      where: { id: booking.seatId },
      data: { status: 'available' },
    });

    //3. Delete the booking
    await this.prisma.booking.delete({ where: { id } });
    return { message: `Booking #${id} successfully cancelled` };
  }

  async findByUserEmail(email: string) {
    // --->1. Ask Prisma to find bookings that match the email
    const userBookings = await this.prisma.booking.findMany({
      where: {
        user: {
          email: email, //   Prisma to look inside the linked User table!
        },
      },
      // Include all the connected data we want to show the user
      include: {
        user: true,
        event: true,
        seat: true,
        payment: true,
      },
    });

    // --->2. Check if they actually have any tickets
    if (userBookings.length === 0) {
      throw new NotFoundException(`No tickets found for email: ${email}`);
    }

    // --->3. Format the response so it looks like a clean, professional receipt
    return userBookings.map((booking) => {
      return {
        ticketId: `TICKET-${booking.id}`,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        movieOrEvent: booking.event.title,
        showTime: booking.event.date,
        seatNumber: booking.seat.seatNo,

        amountPaid: booking.payment?.amount || 'Pending', // We use the "?" just in case they haven't paid yet!    <-----
        paymentStatus: booking.payment?.status || 'No Payment Record',
      };
    });
  }
}
