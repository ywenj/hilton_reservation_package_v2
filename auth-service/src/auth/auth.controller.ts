import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { AuthService } from "./auth.service";
import { BasicAuthGuard } from "./guards/basic-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { username: string; password: string; role?: string }
  ) {
    return this.authService.register(body.username, body.password, body.role);
  }

  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password
    );
    if (!user) return { error: "invalid credentials" };
    return this.authService.login(user);
  }

  // Basic HTTP auth endpoint: client can send Basic auth and get a JWT token
  @UseGuards(BasicAuthGuard)
  @Post("basic-login")
  async basicLogin(@Request() req: ExpressRequest & { user?: any }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async profile(@Request() req: ExpressRequest & { user?: any }) {
    return req.user;
  }
}
