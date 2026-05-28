import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Create event and seats
  async create(createEventDto: CreateEventDto) {
    // get rows and seatsPerRow from dto
    const { rows, seatsPerRow, ...eventData } = createEventDto;

    // create event first
    const newEvent = await this.prisma.event.create({
      data: eventData,
    });

    // array to store all seats
    const seatsToCreate: {
      seatNo: string;
      eventId: number;
      status: string;
    }[] = [];

    // generate seats like A1, A2, B1, B2
    for (let i = 0; i < rows; i++) {
      // convert number to letter
      // 65 = A, 66 = B
      const rowLetter = String.fromCharCode(65 + i);

      for (let j = 1; j <= seatsPerRow; j++) {
        const seat = {
          seatNo: `${rowLetter}${j}`,
          eventId: newEvent.id,
          status: 'available',
        };

        seatsToCreate.push(seat);
      }
    }

    // save seats in database
    await this.prisma.seat.createMany({
      data: seatsToCreate,
    });

    return {
      message: `Event created! ${rows * seatsPerRow} seats generated`,
      event: newEvent,
    };
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: id,
      },

      include: {
        seats: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // get only available seats
    const availableSeats = event.seats
      .filter((seat) => {
        return seat.status === 'available';
      })
      .map((seat) => {
        return {
          id: seat.id,
          seatNo: seat.seatNo,
        };
      });

    // remove seats array from response
    const { seats, ...eventDetails } = event;

    return {
      ...eventDetails,
      availableSeatsList: availableSeats,
    };
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      include: {
        Admin: true,
      },
    });

    return events;
  }

  async getEventSummary() {
    const events = await this.prisma.event.findMany({
      include: {
        seats: true,
      },
    });

    const summary = events.map((event) => {
      const availableSeats = event.seats.filter((seat) => {
        return seat.status === 'available';
      });

      return {
        eventId: event.id,
        title: event.title,
        price: event.price,
        totalSeats: event.seats.length,
        availableSeatsCount: availableSeats.length,
      };
    });

    return summary;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const { adminId, rows, seatsPerRow, ...otherData } = updateEventDto;

    const dataToUpdate: any = {
      ...otherData,
    };

    if (adminId) {
      dataToUpdate.admin = {
        connect: {
          id: adminId,
        },
      };
    }

    // Update event
    const updatedEvent = await this.prisma.event.update({
      where: {
        id: id,
      },
      data: dataToUpdate,
    });

    return updatedEvent;
  }

  async remove(id: number) {
    await this.prisma.event.delete({
      where: {
        id: id,
      },
    });

    return {
      message: `Event #${id} successfully deleted`,
    };
  }
}
