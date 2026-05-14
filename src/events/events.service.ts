import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // POST: Create a new event AND automatically generate seats
  async create(createEventDto: CreateEventDto) {
    // ---> 1.Separate the seat configuration from the event details
    const { rows, seatsPerRow, ...eventData } = createEventDto;

    // 2. Create the Event in the database first
    const newEvent = await this.prisma.event.create({
      data: eventData,
    });

    // 3. Generate the Seats in memory!
    const seatsToCreate: {
      seatNo: string;
      eventId: number;
      status: string;
    }[] = [];

    // ****We use nested loops to create seat numbers like A1, A2, ..., B1, B2, etc.
    for (let i = 0; i < rows; i++) {
      // Secret trick: ASCII code 65 is 'A', 66 is 'B', etc.
      // This converts numbers (0, 1, 2) into letters (A, B, C)
      const rowLetter = String.fromCharCode(65 + i);

      for (let j = 1; j <= seatsPerRow; j++) {
        seatsToCreate.push({
          seatNo: `${rowLetter}${j}`, // Creates "A1", "A2", etc.
          eventId: newEvent.id, // Link it to the event we just created!
          status: 'available',
        });
      }
    }

    // 4. Save ALL the generated seats to the database in one massive batch!
    await this.prisma.seat.createMany({
      data: seatsToCreate,
    });

    return {
      message: `Event created! Automatically generated ${rows * seatsPerRow} seats.`,
      event: newEvent,
    };
  }

  // GET: Find one event and show exactly which seats are free
  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { seats: true }, // Pull in all the generated seats
    });

    if (!event) throw new NotFoundException(`Event #${id} not found`);

    // Filter the seats to only show the available ones
    const availableSeats = event.seats
      .filter((seat) => seat.status === 'available')
      .map((seat) => ({ id: seat.id, seatNo: seat.seatNo })); // Only show ID and Seat Number

    // Remove the raw "seats" array from the output to keep it clean,
    // and replace it with our beautifully formatted "availableSeatsList"
    const { seats, ...eventDetails } = event;

    return {
      ...eventDetails,
      availableSeatsList: availableSeats, // This will show [{id: 16, seatNo: "A1"}, ...]
    };
  }

  async findAll() {
    return this.prisma.event.findMany({ include: { admin: true } });
  }

  // Get all events with price and available seat countn
  async getEventSummary() {
    const events = await this.prisma.event.findMany({
      include: {
        seats: true, // Fetch all seats attached to the event
      },
    });

    // We use a simple map to format the data cleanly for the user
    return events.map((event) => {
      // Filter out only the seats that have the status "available"
      const availableSeats = event.seats.filter(
        (seat) => seat.status === 'available',
      );

      return {
        eventId: event.id,
        title: event.title,
        price: event.price,
        totalSeats: event.seats.length,
        availableSeatsCount: availableSeats.length, // Shows how many are left!  <-----
      };
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: number) {
    await this.prisma.event.delete({ where: { id } });
    return { message: `Event #${id} successfully deleted` };
  }
}
