import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service';
import { CurrentUser } from '../common/decorators';
import { AuthenticatedUser } from '../common/types';

@Controller('restaurants')
@UseGuards(AuthGuard('jwt'))
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.restaurantsService.findAll(user.role, user.country);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.restaurantsService.findById(id, user.role, user.country);
  }

  @Get(':id/menu')
  async getMenu(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.restaurantsService.getMenu(id, user.role, user.country);
  }
}
