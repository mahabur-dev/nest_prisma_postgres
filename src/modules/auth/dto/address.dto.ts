import { IsOptional, IsString} from 'class-validator';

export class addressDto {

  @IsOptional()
  @IsString()
  street!: string;
  
  @IsOptional()
  @IsString()
  city!: string;
  
  @IsOptional()
  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  zipCode!: string;

}