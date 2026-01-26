import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create slug from business name
    const slug = dto.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists, append random number if needed
    let finalSlug = slug;
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingTenant) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Create tenant and user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.businessName,
          slug: finalSlug,
          email: dto.email,
          phone: dto.phone,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'OWNER',
        },
      });

      return { tenant, user };
    });

    // Generate token
    const token = this.generateToken(result.user, result.tenant.id);

    return {
      accessToken: token,
      user: {
        id: result.user.id,
        tenantId: result.tenant.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt.toISOString(),
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        email: result.tenant.email,
        phone: result.tenant.phone,
        defaultDueDay: result.tenant.defaultDueDay,
        reminderDaysBefore: result.tenant.reminderDaysBefore,
        createdAt: result.tenant.createdAt.toISOString(),
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário desativado');
    }

    // Generate token
    const token = this.generateToken(user, user.tenantId);

    return {
      accessToken: token,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        email: user.tenant.email,
        phone: user.tenant.phone,
        defaultDueDay: user.tenant.defaultDueDay,
        reminderDaysBefore: user.tenant.reminderDaysBefore,
        createdAt: user.tenant.createdAt.toISOString(),
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private generateToken(user: { id: string; email: string; role: string }, tenantId: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Create notification for password reset
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    await this.prisma.notification.create({
      data: {
        type: 'WELCOME', // Using WELCOME as we don't have PASSWORD_RESET type
        channel: 'EMAIL',
        recipient: user.email,
        subject: 'Redefinição de Senha - RecorrePay',
        message: `Olá ${user.name},\n\nVocê solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:\n\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`,
        status: 'PENDING',
      },
    });

    // TODO: Actually send the email

    return {
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      // Only return token in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso'
    };
  }
}
