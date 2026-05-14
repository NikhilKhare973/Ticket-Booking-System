import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpayInstance: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpayInstance = new Razorpay({
      key_id: 'rzp_test_SgvTgZz9wBKVoQ', // Your Razorpay Key ID -  key_id
      key_secret: 'C596bzKItPRLND6pfh5fQs4z', // Your Razorpay Key Secret - key_secret
    });
  }

  // 1.generate a payment link for a specific booking and amount <-----
  async createPaymentLink(bookingId: number, amount: number) {
    try {
      const paymentLinkRequest = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        accept_partial: false,
        description: `Payment for Ticket Booking #${bookingId}`,
        reference_id: bookingId.toString(), // CRITICAL: This is how we know which booking paid later!
        customer: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '+919876543210',
        },
        notify: { sms: false, email: false },
        reminder_enable: false,
        // Where the user goes after paying successfully
        callback_url: 'https://google.com',
        callback_method: 'get',
      };

      // Ask Razorpay to create the link
      const paymentLink =
        await this.razorpayInstance.paymentLink.create(paymentLinkRequest);

      // Save a "pending" record in your database
      await this.prisma.payment.create({
        data: {
          amount: amount,
          bookingId: bookingId,
          razorpayOrderId: paymentLink.id, // <---- We store the Link ID here *** (orders ID)** <<<<
          status: 'pending',
        },
      });

      // Send the clickable URL back to the user!
      return {
        message: 'Payment link generated successfully',
        payment_url: paymentLink.short_url,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to generate payment link');
    }
  }

  // 2. THE WEBHOOK (Razorpay calls this function automatically!)  ----- Razorpay sends data here
  async handleWebhook(body: any, signature: string) {
    // ---- > 1.safety check: If there is no body, don't try to process it
    if (!body || !signature) {
      console.log('Received an empty or unsigned webhook request. Ignoring.');
      return { status: 'ignored' };
    }

    const webhookSecret = 'MY_CUSTOM_WEBHOOK_SECRET_123';

    // ----> 2. verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      console.log('Signature Mismatch!');
      throw new BadRequestException('Invalid Webhook Signature');
    }

    // --->3.process sucessful payment webhook ( **** Handle webhook event: payment_link.paid **** )
    if (body.event === 'payment_link.paid') {
      const payload = body.payload;
      const paymentLinkData = payload.payment_link.entity;
      const actualPaymentData = payload.payment.entity; // The actual payment info

      const bookingId = parseInt(paymentLinkData.reference_id);

      // ---** update database **---
      await this.prisma.payment.updateMany({
        where: { bookingId: bookingId },
        data: {
          status: 'success',
          // We save the REAL payment ID (starts with pay_)
          razorpayPaymentId: actualPaymentData.id,
          // WE ADD THIS LINE TO SAVE THE SIGNATURE!
          razorpaySignature: signature,
        },
      });

      console.log(
        ` ✓ Webhook Success: Booking #${bookingId} is now fully PAID and Signed!`,
      );
      return { status: 'ok' };
    }

    return { status: 'ignored' };
  }
  async findAll() {
    return this.prisma.payment.findMany({
      include: { booking: { include: { user: true, event: true } } },
    });
  }
}
