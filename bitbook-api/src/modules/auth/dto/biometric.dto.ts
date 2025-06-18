import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetBiometricDto {
  @ApiProperty({
    description: 'Segredo biométrico gerado pelo app',
    example: 'f7de89df-7e76-4f81-94e0-72430973527b',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  biometricSecret: string;
}

export class BiometricLoginDto {
  @ApiProperty({
    description: 'Segredo biométrico para autenticação',
    example: 'f7de89df-7e76-4f81-94e0-72430973527b',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  biometricSecret: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     BiometricResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login biométrico ativado com sucesso
 *     BiometricLoginResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * tags:
 *   name: Autenticação
 *   description: Endpoints de autenticação do sistema
 * 
 * /auth/set-biometric:
 *   post:
 *     tags: [Autenticação]
 *     summary: Ativa o login biométrico para o usuário
 *     description: |
 *       Este endpoint permite ativar o login biométrico para o usuário autenticado.
 *       Requer um token JWT válido no header Authorization.
 *       
 *       Fluxo:
 *       1. Usuário faz login com credenciais
 *       2. App gera um UUID único como segredo biométrico
 *       3. Segredo é enviado para este endpoint
 *       4. API faz hash do segredo e salva no banco
 *       5. App salva o segredo original no SecureStore
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetBiometricDto'
 *     responses:
 *       200:
 *         description: Login biométrico ativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BiometricResponse'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 * 
 * /auth/login/biometric:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realiza login usando autenticação biométrica
 *     description: |
 *       Este endpoint permite realizar login usando autenticação biométrica.
 *       
 *       Fluxo:
 *       1. App recupera segredo do SecureStore
 *       2. Usuário autentica com biometria no dispositivo
 *       3. Segredo é enviado para este endpoint
 *       4. API valida o segredo e retorna novo token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiometricLoginDto'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BiometricLoginResponse'
 *       401:
 *         description: Credenciais biométricas inválidas
 */ 