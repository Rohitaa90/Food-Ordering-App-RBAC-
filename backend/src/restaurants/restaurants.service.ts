import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Country } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userRole: Role, userCountry: Country | null) {
    const where = userRole === Role.ADMIN ? {} : { country: userCountry! };

    return this.prisma.restaurant.findMany({
      where,
      include: {
        _count: { select: { menuItems: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userRole: Role, userCountry: Country | null) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { available: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Country-based access check
    if (userRole !== Role.ADMIN && restaurant.country !== userCountry) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async getMenu(restaurantId: string, userRole: Role, userCountry: Country | null) {
    const restaurant = await this.findById(restaurantId, userRole, userCountry);

    return restaurant.menuItems;
  }
}
