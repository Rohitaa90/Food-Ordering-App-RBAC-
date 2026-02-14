import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdatePaymentMethodDto } from './dto/update-payment.dto';
import { AuthenticatedUser } from '../common/types';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPaymentMethods(user: AuthenticatedUser) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentMethod(
    id: string,
    dto: UpdatePaymentMethodDto,
    user: AuthenticatedUser,
  ) {
    // Only ADMIN can update payment methods
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update payment methods');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (dto.isDefault) {
      // Set all other payment methods for this user to non-default
      await this.prisma.paymentMethod.updateMany({
        where: { userId: paymentMethod.userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: {
        type: dto.type,
        details: dto.details,
        isDefault: dto.isDefault ?? paymentMethod.isDefault,
      },
    });
  }
}
