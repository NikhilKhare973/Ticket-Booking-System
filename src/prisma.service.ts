import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super(); // Add this line to properly initialize the PrismaClient
  }

  async onModuleInit() {
    await this.$connect();
  }
}
