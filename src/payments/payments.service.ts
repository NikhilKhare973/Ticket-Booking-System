import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  // Create Razorpay object
  private razorpayInstance: Razorpay;

  constructor(private prismaService: PrismaService) {
    // Initialize Razorpay
    this.razorpayInstance = new Razorpay({
      // Razorpay API Key ID
      key_id: 'rzp_test_SgvTgZz9wBKVoQ',

      // Razorpay Secret Key
      key_secret: 'C596bzKItPRLND6pfh5fQs4z',
    });
  }

  // 1. CREATE PAYMENT LINK
  // This function creates a payment link using Razorpay
  // User will click this link to complete payment
  async createPaymentLink(bookingId: number, amount: number) {
    try {
      // Create data object for Razorpay
      const paymentLinkData = {
        amount: amount * 100,

        currency: 'INR',

        // User cannot pay partial amount
        accept_partial: false,

        // Description shown on payment page
        description: `Payment for Ticket Booking #${bookingId}`,

        // **VERY IMPORTANT**
        // We save bookingId here
        // Later webhook uses this to identify booking
        reference_id: bookingId.toString(),

        // Dummy customer details
        customer: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '+919876543210',
        },

        // Disable notifications
        notify: {
          sms: false,
          email: false,
        },

        reminder_enable: false,

        // After successful payment user goes here
        callback_url: 'https://www.youtube.com/',
        callback_method: 'get',
      };

      // Ask Razorpay to generate payment link
      const paymentLink =
        await this.razorpayInstance.paymentLink.create(paymentLinkData);

      // Save payment in database as pending
      await this.prismaService.payment.create({
        data: {
          amount: amount,

          bookingId: bookingId,

          // Save Razorpay payment link ID
          razorpayOrderId: paymentLink.id,

          // Payment not completed yet
          status: 'pending',
        },
      });

      // Send payment URL to frontend/user
      return {
        message: 'Payment link generated successfully',

        payment_url: paymentLink.short_url,
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Failed to generate payment link');
    }
  }

  // 2. HANDLE WEBHOOK
  // Razorpay automatically sends payment data here
  // after payment success/failure
  async handleWebhook(body: any, signature: string) {
    // Safety check - If body or signature missing, ignore request
    if (!body || !signature) {
      console.log('Received empty webhook request');

      return {
        status: 'ignored',
      };
    }

    // Webhook secret
    const webhookSecret = 'MY_CUSTOM_WEBHOOK_SECRET_123';

    // Verify webhook signature
    // This checks if request really came from Razorpay
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    // If signatures do not match
    if (generatedSignature !== signature) {
      console.log('Signature mismatch');

      throw new BadRequestException('Invalid Webhook Signature');
    }

    // PAYMENT SUCCESS EVENT
    // Razorpay sends this event when payment succeeds
    if (body.event === 'payment_link.paid') {
      // Get payload data
      const payload = body.payload;

      // Payment link information
      const paymentLinkInfo = payload.payment_link.entity;

      // Real payment information
      const paymentInfo = payload.payment.entity;

      // Get bookingId from reference_id
      const bookingId = parseInt(paymentLinkInfo.reference_id);

      // Update payment in database
      await this.prismaService.payment.updateMany({
        where: {
          bookingId: bookingId,
        },

        data: {
          // Payment successful
          status: 'success',

          // Save actual Razorpay payment ID
          razorpayPaymentId: paymentInfo.id,

          // Save webhook signature
          razorpaySignature: signature,
        },
      });

      console.log(`Booking #${bookingId} payment successful`);

      return {
        status: 'ok',
      };
    }

    // Ignore unknown events
    return {
      status: 'ignored',
    };
  }

  // 3. GET ALL PAYMENTS
  async findAll() {
    const payments = await this.prismaService.payment.findMany({
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });

    return payments;
  }
}
