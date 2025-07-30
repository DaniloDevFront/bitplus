import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, newPassword: string, userName: string): Promise<void> {
    try {
      const fromEmail = 'Bitbook <contato@bitplus.app.br>'

      const htmlBody = this.generatePasswordResetTemplate(userName, newPassword);

      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: '🔐 IMPORTANTE: Nova Senha - Bitbook',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      this.logger.log(`Email de nova senha enviado com sucesso para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de nova senha: ${error.message}`);
      throw new Error('Falha ao enviar email de nova senha');
    }
  }

  private generatePasswordResetTemplate(userName: string, newPassword: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="X-Priority" content="1">
        <meta name="X-MSMail-Priority" content="High">
        <meta name="Importance" content="High">
        <title>🔐 Nova Senha - Bitbook</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .important-badge {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 10px 0;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          }
          .content {
            margin-bottom: 30px;
          }
          .password-box {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #495057;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Bitbook</div>
            <div class="important-badge">🔐 IMPORTANTE</div>
            <h2>Nova Senha Gerada</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Sua solicitação de recuperação de senha foi processada com sucesso. Uma nova senha foi gerada para sua conta.</p>
            
            <div class="password-box">
              ${newPassword}
            </div>
            
            <p><strong>Instruções importantes:</strong></p>
            <ul>
              <li>Use esta senha para fazer login no aplicativo Bitbook</li>
              <li>Recomendamos que você altere esta senha após o primeiro acesso</li>
              <li>Esta senha é temporária e foi gerada automaticamente</li>
            </ul>
            
            <div class="warning">
              <strong>⚠️ Segurança:</strong> Por questões de segurança, recomendamos que você altere esta senha assim que fizer login no aplicativo.
            </div>
            
            <p>Se você não solicitou esta recuperação de senha, entre em contato conosco imediatamente.</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, não responda a esta mensagem.</p>
            <p>© 2024 Bitbook. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 