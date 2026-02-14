import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Country, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthenticatedUser } from '../common/types';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, user: AuthenticatedUser) {
    // Verify restaurant exists and user has country access
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (user.role !== Role.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot order from restaurants in another country');
    }

    // Verify all menu items exist and belong to the restaurant
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i) => i.menuItemId) },
        restaurantId: dto.restaurantId,
        available: true,
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items are invalid or unavailable');
    }

    // Calculate total
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
    let totalAmount = 0;

    const orderItemsData = dto.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      };
    });

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId: dto.restaurantId,
        country: restaurant.country,
        totalAmount: Math.round(totalAmount * 100) / 100,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        restaurant: true,
      },
    });

    return order;
  }

  async findAll(user: AuthenticatedUser) {
    const where: any = {};

    // Country-based filtering
    if (user.role !== Role.ADMIN) {
      where.country = user.country;
    }

    // Members can only see their own orders
    if (user.role === Role.MEMBER) {
      where.userId = user.id;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        restaurant: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, user: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        restaurant: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Country-based access
    if (user.role !== Role.ADMIN && order.country !== user.country) {
      throw new NotFoundException('Order not found');
    }

    // Members can only see their own orders
    if (user.role === Role.MEMBER && order.userId !== user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async checkout(id: string, user: AuthenticatedUser) {
    // Only ADMIN and MANAGER can checkout
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot checkout orders');
    }

    const order = await this.findById(id, user);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order cannot be checked out. Current status: ${order.status}`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CHECKED_OUT },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        restaurant: true,
      },
    });
  }

  async cancel(id: string, user: AuthenticatedUser) {
    // Only ADMIN and MANAGER can cancel
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot cancel orders');
    }

    const order = await this.findById(id, user);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        restaurant: true,
      },
    });
  }
}
