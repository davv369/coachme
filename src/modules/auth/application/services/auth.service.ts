import { Inject, Injectable } from '@nestjs/common';
import { AuthInPort } from '../ports/in/auth.in-port';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';
import {
  JWT_GENERATOR_OUT_PORT,
  JwtGeneratorOutPort,
} from '../ports/out/jwt-generator.out-port';
import {
  USER_READER_OUT_PORT,
  UserReaderOutPort,
} from '../ports/out/user-reader.out-port';
import {
  USER_WRITER_OUT_PORT,
  UserWriterOutPort,
} from '../ports/out/user-writer.out-port';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import { UserRole } from '../../domain/user-role';

@Injectable()
export class AuthService implements AuthInPort {
  constructor(
    @Inject(JWT_GENERATOR_OUT_PORT)
    private readonly jwtGenerator: JwtGeneratorOutPort,
    @Inject(USER_READER_OUT_PORT)
    private readonly userReader: UserReaderOutPort,
    @Inject(USER_WRITER_OUT_PORT)
    private readonly userWriter: UserWriterOutPort,
  ) {}

  async login(command: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userReader.findUserByEmail({ email: command.email });
    if (!user) {
      throw new DomainException(
        InternalErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const isPasswordValid = await this.userReader.verifyPassword(
      user,
      command.password,
    );
    if (!isPasswordValid) {
      throw new DomainException(
        InternalErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const tokens = this.jwtGenerator.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(command: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser = await this.userReader.findUserByEmail({
      email: command.email,
    });
    if (existingUser) {
      throw new DomainException(
        InternalErrorCode.USER_ALREADY_EXISTS,
        `User with email ${command.email} already exists`,
      );
    }

    if (!Object.values(UserRole).includes(command.role)) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`,
      );
    }

    const user = await this.userWriter.createUser({
      email: command.email,
      password: command.password,
      name: command.name,
      role: command.role,
    });

    const tokens = this.jwtGenerator.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(command: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtGenerator.verifyToken({
        token: command.refreshToken,
      });

      const user = await this.userReader.findUserByEmail({
        email: payload.email,
      });
      if (!user) {
        throw new DomainException(
          InternalErrorCode.NOT_FOUND,
          'User not found',
        );
      }

      const tokens = this.jwtGenerator.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException(
        InternalErrorCode.UNAUTHORIZED,
        'Invalid or expired refresh token',
      );
    }
  }

  async bootstrapAdmin(command: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto> {
    const hasAdmin = await this.userReader.hasAdmin({ role: UserRole.ADMIN });
    if (hasAdmin) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Admin user already exists. Use /api/auth/register endpoint instead.',
      );
    }

    const existingUser = await this.userReader.findUserByEmail({
      email: command.email,
    });
    if (existingUser) {
      throw new DomainException(
        InternalErrorCode.USER_ALREADY_EXISTS,
        `User with email ${command.email} already exists`,
      );
    }

    const user = await this.userWriter.createUser({
      email: command.email,
      password: command.password,
      name: command.name,
      role: UserRole.ADMIN,
    });

    const tokens = this.jwtGenerator.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      message: 'First admin user created successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

