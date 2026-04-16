import { IsInt, IsOptional, IsString} from 'class-validator';

export class AddressDto {

  @IsOptional()
  @IsInt()
  id?: number; 

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