import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');

    // Se não houver credenciais, inicializa com valores vazios
    super({
      clientID: clientID || '',
      clientSecret: clientSecret || '',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      passReqToCallback: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Se não houver credenciais, retorna null
    if (!this.configService.get<string>('FACEBOOK_APP_ID')) {
      return null;
    }

    const { id, name, emails } = profile;
    const user = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    return user;
  }
} 