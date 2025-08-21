import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  exports: [UserService],
  imports: [DatabaseModule],
  providers: [UserService],
})
export class UserModule {}
