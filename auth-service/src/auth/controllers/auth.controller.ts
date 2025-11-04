import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  BadRequestException,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { AuthService } from "../services/auth.service";
import { IntrospectionService } from "../services/introspection.service";
import { IntrospectRequestDto } from "../dto/introspect.dto";
import { BasicAuthGuard } from "../guards/basic-auth.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RegisterEmployeeDto } from "../dto/register-employee.dto";
import { RegisterGuestDto } from "../dto/register-guest.dto";
import { LoginEmployeeDto } from "../dto/login-employee.dto";
import { LoginGuestDto } from "../dto/login-guest.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private introspectionService: IntrospectionService
  ) {}

  private readonly logger = new (require("@nestjs/common").Logger)(
    AuthController.name
  );

  @Post("register/employee")
  async registerEmployee(@Body() body: RegisterEmployeeDto) {
    this.logger.log(`POST /auth/register/employee username=${body.username}`);
    return this.authService.registerEmployee(body.username, body.password);
  }

  @Post("register/guest")
  async registerGuest(@Body() body: RegisterGuestDto) {
    if (!body.email && !body.phone) {
      throw new BadRequestException("Email or phone required");
    }
    this.logger.log(
      `POST /auth/register/guest username=${body.username} email=${body.email} phone=${body.phone}`
    );
    return this.authService.registerGuest({
      email: body.email,
      phone: body.phone,
      username: body.username,
    });
  }

  @Post("login/employee")
  async loginEmployee(@Body() body: LoginEmployeeDto) {
    const token = await this.authService.loginEmployee(
      body.username,
      body.password
    );
    if (!token) return { error: "invalid credentials" };
    this.logger.log(`Employee login success username=${body.username}`);
    return token;
  }

  @Post("login/guest")
  async loginGuest(@Body() body: LoginGuestDto) {
    const token = await this.authService.loginGuest(body.email, body.phone);
    if (!token) return { error: "invalid credentials" };
    this.logger.log(
      `Guest login success email=${body.email} phone=${body.phone}`
    );
    return token;
  }

  @UseGuards(BasicAuthGuard)
  @Post("basic-login")
  async basicLogin(@Request() req: ExpressRequest & { user?: any }) {
    this.logger.log(`Basic login username=${req.user?.username}`);
    return this.authService.loginEmployee(req.user.username, req.user.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async profile(@Request() req: ExpressRequest & { user?: any }) {
    this.logger.debug(`Profile fetch sub=${req.user?.sub}`);
    return req.user;
  }

  @Post("introspect")
  async introspect(@Body() body: IntrospectRequestDto) {
    this.logger.debug(`Introspect token length=${body.token?.length}`);
    return this.introspectionService.introspect(body.token);
  }
}
