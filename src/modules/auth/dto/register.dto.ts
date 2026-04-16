import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class RegisterDto {
  @IsEmail()
  email!: string; // required

  @IsString()
  @MinLength(6)
  password!: string; // required

  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  nid?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}