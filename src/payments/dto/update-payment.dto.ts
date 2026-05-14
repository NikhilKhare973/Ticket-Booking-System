import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreateOrderDto) {}
