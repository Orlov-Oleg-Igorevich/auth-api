import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { randomBytes } from 'crypto';
import { TypedConfigService } from 'src/typed-config/typed-config.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: TypedConfigService,
    private readonly mailerService: MailerService,
  ) {}

  generateEmailConfirmationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async storeEmailToken(userId: string, token: string): Promise<void> {
    this.redisService.set(`email-confirm:${token}`, userId, 2 * 60 * 60);
  }

  async sendEmailConfirmation(email: string, token: string): Promise<void> {
    const confirmLink = `${this.configService.frontendUrl}auth/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Подтвердите ваш email',
      html: `
      <p>Пожалуйста, подтвердите ваш email, перейдя по ссылке:</p>
      <a href="${confirmLink}">Подтвердить</a>
      <p>Ссылка действительна 2 часа.</p>
    `,
    });
  }
}
