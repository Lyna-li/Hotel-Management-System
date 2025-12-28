import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createClient(@Body('id_user', ParseIntPipe) id_user: number) {
    try {
      return await this.clientsService.createClient(id_user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllClients() {
    return await this.clientsService.getAllClients();
  }
  @Get('client/:userId')
  async getClientByUserId(@Param('userId', ParseIntPipe) userId: number) {
  try {
    return await this.clientsService.getClientByUserId(userId);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
}

  @Get(':id')
  async getClientById(@Param('id', ParseIntPipe) id: number) {
    const client = await this.clientsService.getClientById(id);
    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }
    return client;
  }
  
}
