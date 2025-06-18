import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      keyFilePath: process.env.APPLE_KEY_FILE_PATH,
      callbackURL: 'http://localhost:3000/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user: any) => void,
  ): Promise<any> {
    const { email, name } = profile;
    const user = {
      email,
      firstName: name?.firstName,
      lastName: name?.lastName,
      accessToken,
    };

    done(null, user);
  }
} 