// // import { Module } from '@nestjs/common';
// // import { JwtModule } from '@nestjs/jwt';
// // import { PassportModule } from '@nestjs/passport';
// // import { AuthService } from './auth.service';
// // import { AuthController } from './auth.controller';
// // import { JwtStrategy } from './strategies/jwt.strategy';
// // import { UsersModule } from '../users/users.module';

// // @Module({
// //   imports: [
// //     UsersModule,
// //     PassportModule,
// //     JwtModule.register({
// //       secret: process.env.JWT_SECRET,
// //       // signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
// //       signOptions: { expiresIn: '7d' },
// //     }),
// //   ],
// //   providers: [AuthService, JwtStrategy],
// //   controllers: [AuthController],
// // })
// // export class AuthModule {}
// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { UsersModule } from '../users/users.module';

// @Module({
//   imports: [
//     UsersModule,
//     PassportModule,
//     JwtModule.registerAsync({
//       useFactory: () => ({
//         secret: process.env.JWT_SECRET as string,
//         signOptions: { expiresIn: '7d' },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}
import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { CloudinaryService } from '../../common/services/cloudinary.service';
// import { CloudinaryService } from 'src/common/services/cloudinary.service';


// @Global()
@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    // JwtModule.register({
    //   global: true,
    // })
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CloudinaryService],
  controllers: [AuthController],
})
export class AuthModule {}