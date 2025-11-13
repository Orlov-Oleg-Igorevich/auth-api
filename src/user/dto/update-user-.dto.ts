import { IsIn, IsOptional, IsString } from 'class-validator';

type titleType = 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.' | 'Prof.';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'])
  title?: titleType;

  @IsOptional()
  @IsString()
  affiliation?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  orcid?: string;

  @IsOptional()
  @IsString()
  webPage?: string;
}
