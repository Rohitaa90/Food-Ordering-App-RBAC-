import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { UpdatePaymentMethodDto } from './dto/update-payment.dto';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { AuthenticatedUser } from '../common/types';
import { Role } from '@prisma/client';

@Controller('payment-method')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async getPaymentMethods(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getPaymentMethods(user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.updatePaymentMethod(id, dto, user);
  }
}
