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
import { AuthService } from "./auth.service";
import { IntrospectionService } from "./introspection.service";
import { IntrospectRequestDto } from "./dto/introspect.dto";
import { BasicAuthGuard } from "./guards/basic-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterEmployeeDto } from "./dto/register-employee.dto";
import { RegisterGuestDto } from "./dto/register-guest.dto";
import { LoginEmployeeDto } from "./dto/login-employee.dto";
import { LoginGuestDto } from "./dto/login-guest.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private introspectionService: IntrospectionService
  ) {}

  // Employee registration (username + password)
  @Post("register/employee")
  async registerEmployee(@Body() body: RegisterEmployeeDto) {
    return this.authService.registerEmployee(body.username, body.password);
  }

  // Guest registration (email + phone 至少一个; 可选 username)
  @Post("register/guest")
  async registerGuest(@Body() body: RegisterGuestDto) {
    if (!body.email && !body.phone) {
      throw new BadRequestException("Email or phone required");
    }
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
    return token;
  }

  @Post("login/guest")
  async loginGuest(@Body() body: LoginGuestDto) {
    const token = await this.authService.loginGuest(body.email, body.phone);
    if (!token) return { error: "invalid credentials" };
    return token;
  }

  // Basic HTTP auth endpoint retained for employees with Basic auth header
  @UseGuards(BasicAuthGuard)
  @Post("basic-login")
  async basicLogin(@Request() req: ExpressRequest & { user?: any }) {
    return this.authService.loginEmployee(req.user.username, req.user.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async profile(@Request() req: ExpressRequest & { user?: any }) {
    return req.user;
  }

  @Post("introspect")
  async introspect(@Body() body: IntrospectRequestDto) {
    return this.introspectionService.introspect(body.token);
  }
}
