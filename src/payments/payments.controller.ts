import { Controller, Get, Post, Body, Headers, HttpCode } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // payment link yaha create hoge - user ko ye link milega - user uspe click karke payment karega
  @Post('create-link')
  createLink(@Body() dto: CreatePaymentDto) {
    // bookingId and amount come from DTO
    return this.paymentsService.createPaymentLink(dto.bookingId, dto.amount);
  }

  // Razorpay webhook -
  @Post('webhook')

  // Razorpay needs 200 response quickly
  @HttpCode(200)
  handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }
}

// Razorpay webhook- Razorpay sends data here
// Razorpay will call this endpoint when a payment is successful -- we will verify the signature and update our database accordingly
