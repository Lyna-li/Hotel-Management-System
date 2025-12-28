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
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async createEmployee(
    @Body() body: { id_user: number; salaire: number; date_embauche: string },
  ) {
    try {
      return await this.employeesService.createEmployee({
        id_user: body.id_user,
        salaire: body.salaire,
        date_embauche: new Date(body.date_embauche),
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllEmployees() {
    return await this.employeesService.getAllEmployees();
  }

  @Get(':id')
  async getEmployeeById(@Param('id', ParseIntPipe) id: number) {
    const employee = await this.employeesService.getEmployeeById(id);
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
    return employee;
  }
}
