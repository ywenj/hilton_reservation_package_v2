import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(username: string, password: string, role: string = "guest") {
    this.logger.debug(`Register attempt username=${username} role=${role}`);
    const exists = await this.userModel.findOne({ username });
    if (exists) {
      this.logger.warn(
        `Register failed: username already exists (${username})`,
      );
      throw new BadRequestException("User exists");
    }
    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({ username, password: hashed, role });
    await created.save();
    this.logger.log(
      `Register success id=${created._id} username=${created.username}`,
    );
    return { id: created._id, username: created.username, role: created.role };
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password ?? "");
    if (match) {
      this.logger.debug(`Password match for username=${username}`);
      return user;
    }
    this.logger.debug(`Password mismatch for username=${username}`);
    return null;
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, sub: user._id, role: user.role };
    this.logger.log(`Issuing token for sub=${user._id} role=${user.role}`);
    return { access_token: this.jwtService.sign(payload) };
  }

  async registerEmployee(username: string, password: string) {
    try {
      this.logger.debug(`Employee register attempt username=${username}`);
      const exists = await this.userModel.findOne({ username });
      if (exists) {
        this.logger.warn(
          `Employee register failed: exists username=${username}`,
        );
        throw new BadRequestException("User exists");
      }
      const hashed = await bcrypt.hash(password, 10);
      const created = new this.userModel({
        username,
        password: hashed,
        role: "employee",
      });
      await created.save();
      this.logger.log(`Employee register success id=${created._id}`);
      return {
        id: created._id.toString(),
        username: created.username,
        role: created.role,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        this.logger.warn(
          `Employee register duplicate key username=${username}`,
        );
        throw new BadRequestException("Duplicate key");
      }
      this.logger.error(
        `Employee register error username=${username}`,
        err?.stack,
      );
      throw err;
    }
  }

  async registerGuest(data: {
    email?: string;
    phone?: string;
    username?: string;
  }) {
    if (!data.username) {
      throw new BadRequestException("Username is required");
    }
    if (!data.email && !data.phone) {
      throw new BadRequestException("Email or phone is required");
    }
    try {
      this.logger.debug(
        `Guest register attempt username=${data.username} email=${data.email} phone=${data.phone}`,
      );
      const u = await this.userModel.findOne({ username: data.username });
      if (u) throw new BadRequestException("Username exists");
      if (data.email) {
        const e = await this.userModel.findOne({
          email: data.email.toLowerCase(),
        });
        if (e) throw new BadRequestException("Email exists");
      }
      if (data.phone) {
        const p = await this.userModel.findOne({ phone: data.phone });
        if (p) throw new BadRequestException("Phone exists");
      }
      const created = new this.userModel({
        username: data.username,
        email: data.email?.toLowerCase(),
        phone: data.phone,
        role: "guest",
      });
      await created.save();
      this.logger.log(`Guest register success id=${created._id}`);
      return {
        id: created._id.toString(),
        role: created.role,
        email: created.email,
        phone: created.phone,
        username: created.username,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        this.logger.warn(
          `Guest register duplicate key username=${data.username}`,
        );
        throw new BadRequestException("Duplicate key");
      }
      this.logger.error(
        `Guest register error username=${data.username}`,
        err?.stack,
      );
      throw err;
    }
  }

  async loginEmployee(username: string, pass: string) {
    const user = await this.userModel.findOne({ username, role: "employee" });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password || "");
    if (!match) return null;
    this.logger.log(`Employee login success username=${username}`);
    return this.issueToken(user);
  }

  async loginGuest(email?: string, phone?: string) {
    if (!email && !phone) return null;
    const criteria: any = { role: "guest" };
    if (email) criteria.email = email.toLowerCase();
    if (phone) criteria.phone = phone;
    const user = await this.userModel.findOne(criteria);
    if (!user) return null;
    this.logger.log(`Guest login success email=${email} phone=${phone}`);
    return this.issueToken(user);
  }

  private issueToken(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      role: user.role,
      username: user.username,
    };
    this.logger.debug(`Issue JWT for sub=${payload.sub} role=${payload.role}`);
    return { access_token: this.jwtService.sign(payload) };
  }
}
