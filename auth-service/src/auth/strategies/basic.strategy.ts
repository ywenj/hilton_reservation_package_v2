import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy as HttpBasicStrategy } from "passport-http";
import { AuthService } from "../auth.service";

@Injectable()
export class BasicStrategy extends PassportStrategy(
  HttpBasicStrategy,
  "basic"
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) return false;
    return user;
  }
}
