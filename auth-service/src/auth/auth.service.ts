import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string, role: string = 'guest') {
    const exists = await this.userModel.findOne({ username });
    if (exists) throw new BadRequestException('User exists');
    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({ username, password: hashed, role });
    await created.save();
    return { id: created._id, username: created.username, role: created.role };
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) return user;
    return null;
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, sub: user._id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
