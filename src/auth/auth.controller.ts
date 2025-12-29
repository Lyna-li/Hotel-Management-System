import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { EmployeesService } from '../employees/employees.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly employeesService: EmployeesService,
  ) {}

  // ---------------- CLIENT SIGNUP ----------------
  @Post('signup/client')
  async signupClient(@Body() dto: CreateUserDto) {
    // Create user with role CLIENT
    const user = await this.usersService.createUser({
      ...dto,
      role: UserRole.CLIENT,
    });

    // Create client profile
    await this.clientsService.createClient(user.id_user);

    return { user, message: 'Client created successfully' };
  }

  // ---------------- EMPLOYEE CREATION (ADMIN ONLY) ----------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('create/employee')
  async createEmployee(
    @Body() userDto: CreateUserDto,
    @Body() employeeDto: CreateEmployeeDto,
  ) {
    // 1️⃣ Create user with role EMPLOYEE
    const user = await this.usersService.createUser({
      ...userDto,
      role: UserRole.EMPLOYEE,
    });

    // 2️⃣ Create employee profile
const employee = await this.employeesService.createEmployee({
  ...employeeDto,
  id_user: user.id_user,
  date_embauche: new Date(employeeDto.date_embauche), // convert string → Date
});


    return { user, employee, message: 'Employee created successfully' };
  }

  // ---------------- ADMIN CREATION (ADMIN ONLY) ----------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('create/admin')
  async createAdmin(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser({
      ...dto,
      role: UserRole.ADMIN,
    });
    return { user, message: 'Admin created successfully' };
  }

  // ---------------- LOGIN ----------------
  @Post('login')
  async login(@Body() body: { email: string; mot_de_passe: string }) {
    const user = await this.authService.validateUser(
      body.email,
      body.mot_de_passe,
    );
    // Generate JWT token (you can implement JwtService here)
    return { user, token: '' };
  }
}
