import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(username: string, password: string, role: string = "guest") {
    const exists = await this.userModel.findOne({ username });
    if (exists) throw new BadRequestException("User exists");
    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({ username, password: hashed, role });
    await created.save();
    return { id: created._id, username: created.username, role: created.role };
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password ?? "");
    if (match) return user;
    return null;
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, sub: user._id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async registerEmployee(username: string, password: string) {
    try {
      const exists = await this.userModel.findOne({ username });
      if (exists) throw new BadRequestException("User exists");
      const hashed = await bcrypt.hash(password, 10);
      const created = new this.userModel({
        username,
        password: hashed,
        role: "employee",
      });
      await created.save();
      return {
        id: created._id.toString(),
        username: created.username,
        role: created.role,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("Duplicate key");
      }
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
      return {
        id: created._id.toString(),
        role: created.role,
        email: created.email,
        phone: created.phone,
        username: created.username,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException("Duplicate key");
      }
      throw err;
    }
  }

  async loginEmployee(username: string, pass: string) {
    const user = await this.userModel.findOne({ username, role: "employee" });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password || "");
    if (!match) return null;
    return this.issueToken(user);
  }

  async loginGuest(email?: string, phone?: string) {
    if (!email && !phone) return null;
    const criteria: any = { role: "guest" };
    if (email) criteria.email = email.toLowerCase();
    if (phone) criteria.phone = phone;
    const user = await this.userModel.findOne(criteria);
    if (!user) return null;
    return this.issueToken(user);
  }

  private issueToken(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      role: user.role,
      username: user.username,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
