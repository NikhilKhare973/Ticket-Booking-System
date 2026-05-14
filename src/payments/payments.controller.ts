import { Controller, Get, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ****** 1.route to generate the link ******
  @Post('create-link')
  createLink(@Body() dto: CreateOrderDto) {
    // Reusing the CreateOrderDto which has bookingId and amount
    return this.paymentsService.createPaymentLink(dto.bookingId, dto.amount);
  }

  // 2.The Webhook Route (Razorpay sends data here) <------- Imp
  @Post('webhook')
  @HttpCode(200) // Razorpay requires a 200 OK response immediately
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
